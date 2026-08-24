import fs from 'node:fs';

const tree = JSON.parse(fs.readFileSync('src/data/roadmap-tree.json', 'utf8'));
const uele = JSON.parse(fs.readFileSync('src/data/uele-objects.json', 'utf8'));

const registryFiles = [
  'knowledge', 'skills', 'software', 'standards', 'workflow', 'projects',
  'career-roles', 'organizations', 'courses', 'plugins', 'drawings', 'templates', 'resources'
];
const registries = {};
const registryCounts = {};
for (const name of registryFiles) {
  const data = JSON.parse(fs.readFileSync(`src/data/registries/${name}.json`, 'utf8'));
  const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  registries[camel] = data;
  registryCounts[name] = Object.keys(data).length;
}

// Flatten roadmap tree
function flatten(nodes, out = []) {
  for (const n of nodes) {
    out.push(n);
    if (n.children && n.children.length) flatten(n.children, out);
  }
  return out;
}
const nodes = flatten(tree);

// Duplicate roadmap IDs
const seen = new Set();
const dupNodeIds = [];
for (const n of nodes) {
  if (seen.has(n.id)) dupNodeIds.push(n.id);
  seen.add(n.id);
}

// Duplicate registry IDs (key vs item.id mismatch, or dup keys - JSON.parse already dedupes keys)
const idMismatches = {};
for (const [name, reg] of Object.entries(registries)) {
  const bad = Object.entries(reg).filter(([k, v]) => v.id !== k).map(([k]) => k);
  if (bad.length) idMismatches[name] = bad;
}

// Broken relations
const broken = [];
for (const n of nodes) {
  if (!n.relations) continue;
  for (const [field, ids] of Object.entries(n.relations)) {
    if (!ids || !ids.length) continue;
    const camel = field; // fields already match registry keys (knowledge, skills, software, standards, workflow, projects, careerRoles, organizations, courses, plugins, drawings, templates, resources)
    const map = {
      knowledge: 'knowledge', skills: 'skills', software: 'software', standards: 'standards',
      workflow: 'workflow', projects: 'projects', careerRoles: 'careerRoles',
      organizations: 'organizations', courses: 'courses', plugins: 'plugins',
      drawings: 'drawings', templates: 'templates', resources: 'resources'
    };
    const regKey = map[field];
    const reg = registries[regKey];
    if (!reg) { broken.push({ node: n.id, field, id: '(no registry: ' + field + ')' }); continue; }
    for (const relId of ids) {
      if (!reg[relId]) broken.push({ node: n.id, field, id: relId });
    }
  }
}

// UELE object ID uniqueness
const ueleObjects = Array.isArray(uele) ? uele : uele.objects;
const ueleIds = ueleObjects.map(o => o.id);
const dupUeleIds = ueleIds.filter((id, i) => ueleIds.indexOf(id) !== i);

console.log('--- Roadmap ---');
console.log('Total nodes:', nodes.length);
console.log('Duplicate node IDs:', dupNodeIds.length ? dupNodeIds : 'none');
console.log('');
console.log('--- Registries (counts) ---');
console.log(registryCounts);
console.log('ID/key mismatches:', Object.keys(idMismatches).length ? idMismatches : 'none');
console.log('');
console.log('--- Relations ---');
console.log('Broken relation references:', broken.length ? broken : 'none');
console.log('');
console.log('--- UELE ---');
const ueleEnvironments = new Set(ueleObjects.map(o => o.environment));
console.log('Environments:', ueleEnvironments.size, 'Objects:', ueleObjects.length);
console.log('Duplicate UELE object IDs:', dupUeleIds.length ? dupUeleIds : 'none');
