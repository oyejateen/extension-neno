# Nenodocs
## to check if summarizer is available
const canSummarize = await ai.summarizer.capabilities();
let summarizer;
if (canSummarize && canSummarize.available !== 'no') {
  if (canSummarize.available === 'readily') {
    // The summarizer can immediately be used.
    summarizer = await ai.summarizer.create();
  } else {
    // The summarizer can be used after the model download.
    summarizer = await ai.summarizer.create();
    summarizer.addEventListener('downloadprogress', (e) => {
      console.log(e.loaded, e.total);
    });
    await summarizer.ready;
  }
} else {
    // The summarizer can't be used at all.
}

## to summarize a document
const summary = await summarizer.summarize(document);
console.log(summary);

## to realse the resources
await summarizer.destroy();
