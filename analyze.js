function analyzeStory(story) {
  const refinedDescription = (story.description || '').trim();
  const descLower = refinedDescription.toLowerCase();
  let priority = 'P3';
  if (/urgent|immediate|must/.test(descLower)) {
    priority = 'P1';
  } else if (/should|important/.test(descLower)) {
    priority = 'P2';
  }
  const acceptanceCriteria = [
    `Given ${story.title}, the system handles it correctly`,
    `Edge cases for ${story.title} are covered`,
    `Outputs result for ${story.title}`
  ];
  const testCases = [
    `Succeeds when ${story.title} data is valid`,
    `Fails when required fields are missing`,
    `Fails when data is in the wrong format`
  ];
  return {
    id: story.id,
    title: story.title,
    refinedDescription,
    priority,
    acceptanceCriteria,
    testCases
  };
}

function analyzeMany(stories) {
  return stories.map(analyzeStory);
}

function summaryMarkdown(analyses) {
  const header = '| ID | Title | Priority |\n| --- | --- | --- |';
  const rows = analyses.map(a => `| ${a.id || ''} | ${a.title || ''} | ${a.priority} |`).join('\n');
  return `${header}\n${rows}`;
}

module.exports = { analyzeStory, analyzeMany, summaryMarkdown };
