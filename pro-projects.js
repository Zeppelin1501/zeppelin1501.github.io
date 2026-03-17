/* pro-projects.js - professional case-study spotlight */
var PRO_PROJECTS_DATA = [
  {
    id: 'xr-ai',
    kicker: 'Current Build',
    title: 'AI Multiplayer XR Worlds',
    client: 'Option 1 World · Dubai',
    sector: 'XR / AI',
    window: '2025 - Present',
    mode: 'Live deployment',
    summary: 'Networked XR experiences built around shared spatial presence, conversational AI, and real-time visual systems that react to physical triggers.',
    highlights: [
      'Multiplayer spatial-anchor flows for synchronized shared interaction.',
      'Convai-powered NPC behaviour layered into immersive scenes.',
      'GPU particles, DMX cues, and live sensor input connected into one real-time loop.'
    ],
    stack: ['Unity 6', 'VR/XR', 'Convai AI', 'Spatial Anchors', 'Sensors', 'DMX'],
    note: 'Detailed build walkthroughs are available on request.'
  },
  {
    id: 'museum',
    kicker: 'Cultural Spaces',
    title: 'Museum and Cultural Installations',
    client: 'Saadiyat Museum · UAE',
    sector: 'Immersive installation',
    window: 'Selected client work',
    mode: 'Public-facing',
    summary: 'Interactive exhibit-style experiences designed for public audiences, with emphasis on responsive visuals, intuitive interactions, and venue-safe reliability.',
    highlights: [
      'Real-time Unity scenes prepared for continuous public use.',
      'Gesture and sensor-driven interaction patterns tailored to non-technical visitors.',
      'Polish focused on clarity, pacing, and operator-friendly handoff.'
    ],
    stack: ['Unity', 'Gesture Input', 'Sensor Systems', 'Installation QA', 'Realtime Visuals'],
    note: 'Presented as a capability snapshot because the local workspace does not include a separate client case-study page.'
  },
  {
    id: 'gov',
    kicker: 'Public Sector',
    title: 'Government Interactive Systems',
    client: 'Abu Dhabi Government / Dubai Police',
    sector: 'Public engagement',
    window: 'Selected client work',
    mode: 'High-visibility events',
    summary: 'Interactive systems for government and civic showcases where responsiveness, robustness, and clean audience interaction design are critical.',
    highlights: [
      'Object-recognition and gesture-led interaction flows.',
      'Embedded hardware pipelines built with Arduino and Raspberry Pi integrations.',
      'Deployment-minded builds prepared for live demonstrations and event traffic.'
    ],
    stack: ['Unity 3D', 'Object Recognition', 'Arduino', 'Raspberry Pi', 'Kinect'],
    note: 'Specific event deliverables are grouped here into one concise professional summary.'
  },
  {
    id: 'hospitality',
    kicker: 'Premium Activations',
    title: 'Hospitality and Destination Experiences',
    client: 'Jumeirah Hotels / Saudi PIF',
    sector: 'Experiential brand work',
    window: 'Selected client work',
    mode: 'Venue-ready',
    summary: 'Interactive visual moments for premium spaces that blend branded presentation, live responsiveness, and polished visitor-facing execution.',
    highlights: [
      'Projection-friendly real-time content adapted to venue flow.',
      'Interactive scenes tuned for premium presentation and low-friction operation.',
      'Show-control aware creative builds shaped for memorable guest engagement.'
    ],
    stack: ['Projection Mapping', 'Unity', 'Interaction Design', 'Realtime Graphics', 'Show Control'],
    note: 'This snapshot consolidates hospitality-facing work into a single portfolio view.'
  },
  {
    id: 'events',
    kicker: 'Large-Scale Events',
    title: 'Sensor-Fused Event Platforms',
    client: 'Creative Technology LLC · Dubai',
    sector: 'Live event systems',
    window: '2023 - 2025',
    mode: 'Production support',
    summary: 'Large-format interactive experiences connecting computer vision, motion sensing, and embedded hardware into reliable event-ready systems.',
    highlights: [
      'Leap Motion, Kinect, Arduino, and Raspberry Pi wired into Unity pipelines.',
      '2D and 3D experiences delivered for large-scale global event contexts.',
      'Projection, gesture, and installation logic tuned for repeatable on-site execution.'
    ],
    stack: ['Unity 3D', 'Leap Motion', 'Kinect', 'Arduino', 'Projection Mapping', 'Event Ops'],
    note: 'This is the most direct match to the current workspace experience data.'
  }
];
window.PRO_PROJECTS_DATA = PRO_PROJECTS_DATA;

document.addEventListener('DOMContentLoaded', function() {
  var nav = document.getElementById('proNav');
  var detail = document.getElementById('proDetail');
  if (!nav || !detail) return;

  function renderDetail(project) {
    detail.innerHTML = [
      '<div class="pro-badge-row">',
      '  <span class="pro-badge emph">' + project.sector + '</span>',
      '  <span class="pro-badge">' + project.window + '</span>',
      '  <span class="pro-badge">' + project.mode + '</span>',
      '</div>',
      '<h3>' + project.title + '</h3>',
      '<div class="pro-client">' + project.client + '</div>',
      '<p class="pro-summary">' + project.summary + '</p>',
      '<div class="pro-stats">',
      '  <div class="pro-stat"><span>Focus</span><strong>' + project.sector + '</strong></div>',
      '  <div class="pro-stat"><span>Window</span><strong>' + project.window + '</strong></div>',
      '  <div class="pro-stat"><span>Delivery</span><strong>' + project.mode + '</strong></div>',
      '</div>',
      '<ul class="pro-points">' +
        project.highlights.map(function(item) { return '<li>' + item + '</li>'; }).join('') +
      '</ul>',
      '<div class="pro-stack">' +
        project.stack.map(function(item) { return '<span>' + item + '</span>'; }).join('') +
      '</div>',
      '<div class="pro-cta-row">',
      '  <a class="btn btn-primary" href="#s-contact">Request Case Study</a>',
      '  <p class="section-note">' + project.note + '</p>',
      '</div>'
    ].join('');
  }

  function setActive(projectId, fromUser) {
    PRO_PROJECTS_DATA.forEach(function(project, index) {
      var button = nav.children[index];
      if (button) button.classList.toggle('active', project.id === projectId);
      if (project.id === projectId) renderDetail(project);
    });
    if (fromUser && window.addScore) addScore(20);
  }

  PRO_PROJECTS_DATA.forEach(function(project) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'pro-tab';
    button.setAttribute('aria-label', project.title);
    button.innerHTML =
      '<span class="pro-tab-meta">' + project.kicker + '</span>' +
      '<span class="pro-tab-title">' + project.title + '</span>';
    button.addEventListener('click', function() {
      setActive(project.id, true);
    });
    nav.appendChild(button);
  });

  setActive(PRO_PROJECTS_DATA[0].id, false);
});
