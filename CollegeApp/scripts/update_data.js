/*
  Script to upsert users and posts for CMU and Pitt into the running local server (http://localhost:3002).
  Usage: node CollegeApp/scripts/update_data.js
*/

(async () => {
  const baseUrl = (process.env.PORT ? `http://localhost:${process.env.PORT}/api/data` : 'http://localhost:3003/api/data');

  async function get(key) {
    const res = await fetch(`${baseUrl}?key=${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error(`GET ${key} failed: ${res.status}`);
    return res.json();
  }

  async function set(key, data) {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data }),
    });
    if (!res.ok) throw new Error(`POST ${key} failed: ${res.status}`);
  }

  function upsertUsers(existingUsers) {
    const users = [...existingUsers];
    const findByEmail = (email) => users.find((u) => u.email === email);
    const nextId = () => Math.max(0, ...users.map((u) => u.id || 0)) + 1;

    const CMU = { name: 'Carnegie Mellon University', lat: 40.4433, lng: -79.944 };
    const PITT = { name: 'University of Pittsburgh', lat: 40.444, lng: -79.9532 };

    const toAdd = [
      { email: 'rachelwang@cmu.edu', uni: CMU, first: 'Rachel', last: 'Wang', pic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786', bio: 'CS major focusing on responsible AI.', year: '2026' },
      { email: 'jamesmitchell@cmu.edu', uni: CMU, first: 'James', last: 'Mitchell', pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', bio: 'Robotics student building collaborative robots.', year: '2025' },
      { email: 'sophiachen@cmu.edu', uni: CMU, first: 'Sophia', last: 'Chen', pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', bio: 'HCI designer building inclusive tools.', year: '2026' },
      { email: 'michaelrodriguez@pitt.edu', uni: PITT, first: 'Michael', last: 'Rodriguez', pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', bio: 'Bioengineering student creating medical devices.', year: '2025' },
      { email: 'emilyzhang@pitt.edu', uni: PITT, first: 'Emily', last: 'Zhang', pic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786', bio: 'Environmental science student working on green cities.', year: '2026' },
    ];

    for (const spec of toAdd) {
      if (findByEmail(spec.email)) continue;
      users.push({
        id: nextId(),
        email: spec.email,
        university: spec.uni.name,
        lat: spec.uni.lat,
        lng: spec.uni.lng,
        profile: {
          firstName: spec.first,
          lastName: spec.last,
          bio: spec.bio,
          picture: spec.pic,
          graduationYear: spec.year,
          hasIdea: 'yes',
          isWorkingOnIdea: 'yes',
          social: {},
        },
      });
    }
    return users;
  }

  function upsertPosts(existingPosts, users) {
    const posts = [...existingPosts];
    const nextId = () => Math.max(0, ...posts.map((p) => p.id || 0)) + 1;
    const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));

    const postSpecs = [
      { email: 'rachelwang@cmu.edu', uni: 'Carnegie Mellon University', title: 'Ethical AI Framework', summary: 'Responsible AI toolkit: bias detection, transparency tools, ethical guidelines.', lookingFor: 'AI researchers, ethicists, engineers', category: 'Tech', projectLink: 'https://ethicalai.cmu.edu', stage: 'prototype' },
      { email: 'jamesmitchell@cmu.edu', uni: 'Carnegie Mellon University', title: 'Collaborative Robotics Lab', summary: 'Next-gen cobots with advanced vision and haptics.', lookingFor: 'Robotics, CV, ME, safety', category: 'Tech', projectLink: '', stage: 'development' },
      { email: 'sophiachen@cmu.edu', uni: 'Carnegie Mellon University', title: 'Accessible Design Platform', summary: 'Automated accessibility testing and inclusive design guidelines.', lookingFor: 'UX, a11y experts, FE devs', category: 'Social Impact', projectLink: '', stage: 'idea' },
      { email: 'michaelrodriguez@pitt.edu', uni: 'University of Pittsburgh', title: 'Community Health Monitor', summary: 'Portable diagnostics for underserved communities.', lookingFor: 'Biomed, clinicians, mobile devs', category: 'Health', projectLink: 'https://communityhealth.pitt.edu', stage: 'beta' },
      { email: 'emilyzhang@pitt.edu', uni: 'University of Pittsburgh', title: 'Green Infrastructure Network', summary: 'Rain gardens, green roofs, permeable pavements for urban resilience.', lookingFor: 'Env engineers, planners, landscape architects', category: 'Sustainability', projectLink: '', stage: 'planning' },
    ];

    // Avoid duplicates by title + university
    const exists = new Set(posts.map((p) => `${p.title}::${p.university}`));
    const today = new Date().toISOString().slice(0, 10);

    for (const spec of postSpecs) {
      const author = byEmail[spec.email];
      if (!author) continue;
      const key = `${spec.title}::${spec.uni}`;
      if (exists.has(key)) continue;
      posts.push({
        id: nextId(),
        userId: author.id,
        university: spec.uni,
        title: spec.title,
        summary: spec.summary,
        lookingFor: spec.lookingFor,
        category: spec.category,
        projectLink: spec.projectLink,
        stage: spec.stage,
        createdAt: today,
        comments: [],
      });
    }
    return posts;
  }

  try {
    const [users, posts] = await Promise.all([get('users'), get('posts')]);
    const updatedUsers = upsertUsers(users);
    if (updatedUsers !== users) await set('users', updatedUsers);
    const updatedPosts = upsertPosts(posts, updatedUsers);
    if (updatedPosts !== posts) await set('posts', updatedPosts);
    console.log('Upserted users:', updatedUsers.filter(u => ['cmu.edu','pitt.edu'].some(d => u.email.endsWith(d))).length);
    console.log('Upserted posts count:', updatedPosts.length);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();


