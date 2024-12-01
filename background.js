let summarizer = null;

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request.action);
    
    if (request.action === 'checkSummarizer') {
        checkSummarizerAvailability().then(sendResponse);
        return true;
    }
    
    if (request.action === 'analyze') {
        console.log('Starting content analysis...');
        analyzeContent(request.content).then(sendResponse);
        return true;
    }
});

async function checkSummarizerAvailability() {
    console.log('Checking summarizer availability...');
    try {
        const canSummarize = await ai.summarizer.capabilities();
        console.log('Summarizer capability check result:', canSummarize);
        return canSummarize && canSummarize.available !== 'no';
    } catch (error) {
        console.error('❌ Error checking summarizer availability:', error);
        return false;
    }
}

async function analyzeContent(content) {
    console.log('Analyzing content...');
    try {
        if (!summarizer) {
            console.log('Initializing summarizer...');
            const canSummarize = await ai.summarizer.capabilities();
            
            if (canSummarize.available === 'readily' || canSummarize.available === 'after-download') {
                summarizer = await ai.summarizer.create();
                
                if (canSummarize.available === 'after-download') {
                    console.log('Downloading summarizer model...');
                    await summarizer.ready;
                    console.log('Model download complete!');
                }
            } else {
                throw new Error('Summarizer not available');
            }
        }

        const systemPrompt = `
            Analyze this policy/terms document and provide a well-formatted markdown response with:

            # Summary
            A brief 2-3 sentence overview of the document.

            # Critical Points
            List 3-5 most important points that users should be aware of:
            * Point 1
            * Point 2
            * Point 3

            # Privacy & Security Concerns
            List any potential privacy or security concerns:
            * Concern 1
            * Concern 2

            Note: Use markdown formatting for headers, lists, and emphasis where appropriate.
        `;

        console.log('Generating summary...');
        console.log('System prompt:', systemPrompt);
        console.log('Content:', content);
        const summary = await summarizer.summarize(content, { systemPrompt });
        console.log('Summary generated successfully!');
        return summary;

    } catch (error) {
        console.error('❌ Analysis error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
    }
} 