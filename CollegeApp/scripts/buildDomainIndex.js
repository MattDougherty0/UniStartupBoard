#!/usr/bin/env node
/**
 * Build a comprehensive US university domain → { name, lat, lng, city } index.
 *
 * Sources:
 * - Hipo world university domains list (domains + names):
 *   https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json
 * - OpenStreetMap Nominatim for geocoding (free, rate-limited):
 *   https://nominatim.openstreetmap.org
 *
 * What it does:
 * - Loads the existing domain_index.json (if present) as seed.
 * - Fetches US universities from Hipo dataset, normalizes domains.
 * - Merges with existing entries; keeps any curated/accurate coords you already have.
 * - Geocodes missing lat/lng with a low-rate throttle and writes a persistent cache to scripts/cache/geocode.json.
 * - Writes the merged result back to CollegeApp/data/domain_index.json.
 *
 * Usage:
 *   node scripts/buildDomainIndex.js
 *
 * Notes:
 * - First run may take a while if many geocodes are missing (Nominatim rate limits ~1 qps; we throttle harder).
 * - You can safely re-run; cached results are reused.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_FILE = path.join(DATA_DIR, 'domain_index.json');
const CACHE_DIR = path.join(__dirname, 'cache');
const GEO_CACHE_FILE = path.join(CACHE_DIR, 'geocode.json');

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// Helper sleep
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// Load existing index
function loadExistingIndex() {
  try {
    const raw = fs.readFileSync(OUT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveIndex(map) {
  fs.writeFileSync(OUT_FILE, JSON.stringify(map, null, 2));
}

function loadGeoCache() {
  try {
    return JSON.parse(fs.readFileSync(GEO_CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveGeoCache(cache) {
  fs.writeFileSync(GEO_CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function fetchUSUniversities() {
  const url = 'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json';
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error('Failed to fetch domains list: ' + res.status);
  const all = await res.json();
  // Filter US entries and flatten to [{name, domain, state}]
  const us = all.filter(x => x.alpha_two_code === 'US' && Array.isArray(x.domains) && x.domains.length > 0);
  const rows = [];
  us.forEach(u => {
    // Some have multiple domains; keep primary patterns (prefer .edu)
    const primary = u.domains.find(d => d.endsWith('.edu')) || u.domains[0];
    const domain = primary.toLowerCase();
    rows.push({ name: u.name, domain, state: u['state-province'] || '' });
  });
  return dedupeByDomain(rows);
}

function dedupeByDomain(rows) {
  const map = new Map();
  for (const r of rows) {
    const d = r.domain;
    if (!map.has(d)) map.set(d, r);
  }
  return Array.from(map.values());
}

async function geocode(name, cityOrState, cache) {
  const key = `${name}|${cityOrState}`.trim();
  if (cache[key]) return cache[key];
  const q = `${name} ${cityOrState}`.trim();
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'UniStartupBoard/1.0 (https://unistartupboard.vercel.app)'
    }
  });
  if (!res.ok) throw new Error('geocode http ' + res.status);
  const arr = await res.json();
  let out = null;
  if (Array.isArray(arr) && arr.length > 0) {
    const it = arr[0];
    out = { lat: parseFloat(it.lat), lng: parseFloat(it.lon) };
  }
  cache[key] = out;
  return out;
}

async function main() {
  console.log('Building domain index...');
  const existing = loadExistingIndex();
  const geoCache = loadGeoCache();
  const rows = await fetchUSUniversities();

  // Merge and geocode
  const merged = { ...existing };
  let count = 0;
  for (const r of rows) {
    const domain = r.domain;
    const already = merged[domain];
    if (already && already.lat != null && already.lng != null) continue; // keep curated

    const city = already?.city || (r.state || '').toString();
    let coords = null;
    try {
      coords = await geocode(r.name, city, geoCache);
      // throttle to respect Nominatim
      await sleep(1100);
    } catch (e) {
      console.warn('Geocode failed for', r.name, domain, e.message);
    }
    if (!coords && already && already.lat && already.lng) {
      coords = { lat: already.lat, lng: already.lng };
    }
    if (!coords) {
      // as a last resort, skip coords (client will geocode lazily)
      coords = null;
    }
    merged[domain] = {
      name: r.name,
      lat: coords?.lat ?? existing[domain]?.lat ?? null,
      lng: coords?.lng ?? existing[domain]?.lng ?? null,
      city: already?.city || undefined
    };
    count++;
    if (count % 20 === 0) {
      console.log(`Processed ${count} / ${rows.length}...`);
      saveGeoCache(geoCache);
      saveIndex(merged);
    }
  }

  saveGeoCache(geoCache);
  saveIndex(merged);
  console.log('Done. Domains in index:', Object.keys(merged).length);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});



