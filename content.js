// Create and inject the analyze button
function createAnalyzeButton() {
    console.log('Creating analyze button...');
    const button = document.createElement('button');
    button.id = 'policy-analyzer-btn';
    button.textContent = 'Analyze Policy';
    button.addEventListener('click', analyzePage);
    document.body.appendChild(button);
    console.log('Analyze button created and injected');
}

// Extract text content from the page
function extractPageContent() {
    console.log('Extracting page content...');
    const content = document.body.innerText;
    console.log(`Extracted ${content.length} characters of content`);
    return content;
}

// Function to handle the analysis
async function analyzePage() {
    const button = document.getElementById('policy-analyzer-btn');
    
    try {
        console.log('Starting page analysis...');
        showNotification('Checking AI capabilities...', 'info');
        
        const canSummarize = await chrome.runtime.sendMessage({ action: 'checkSummarizer' });
        
        if (!canSummarize) {
            showNotification('Your browser does not support the Neno AI summarizer.', 'error');
            return;
        }

        button.textContent = 'Analyzing...';
        button.disabled = true;
        showNotification('Analyzing policy content...', 'info');

        const content = extractPageContent();
        console.log('Extracted content:', content);
        
        if (content.length < 100) {
            showNotification('Not enough content to analyze on this page.', 'warning');
            return;
        }

        const summary = await chrome.runtime.sendMessage({
            action: 'analyze',
            content: content
        });

        showResults(summary);
        showNotification('Analysis complete!', 'success');

    } catch (error) {
        console.error('❌ Analysis failed:', error);
        showNotification('Failed to analyze the page. Please try again.', 'error');
    } finally {
        button.textContent = 'Analyze Policy';
        button.disabled = false;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `policy-analyzer-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Function to display results
function showResults(summary) {
    const existingResults = document.getElementById('policy-analysis-results');
    if (existingResults) {
        existingResults.remove();
    }

    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'policy-analysis-results';
    resultsDiv.innerHTML = `
        <div class="results-content">
            <div class="results-header">
                <h3>Policy Analysis Summary</h3>
                <button class="close-button" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="results-body markdown-content">
                ${formatSummary(summary)}
            </div>
            <div class="results-footer">
                <button class="action-button" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(resultsDiv);
}

function formatSummary(summary) {
    // First convert markdown to HTML
    const html = markdownToHtml(summary);
    
    // Add any additional formatting
    return html
        .replace(/•/g, '<br>•')
        .replace(/(\d+\.|-)([^\n]+)/g, '<br>$1$2');
}

// Add this new markdown parser function
function markdownToHtml(markdown) {
    return markdown
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        
        // Lists
        .replace(/^\s*\d+\.\s+(.*)/gm, '<li>$1</li>')
        .replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>')
        
        // Wrap lists in ul/ol
        .replace(/(<li>.*?<\/li>)\s*\n/g, '<ul>$1</ul>')
        
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        
        // Paragraphs
        .replace(/\n\s*\n/g, '</p><p>')
        
        // Line breaks
        .replace(/\n/g, '<br>')
        
        // Wrap in paragraph if not already wrapped
        .replace(/^(.+)$/, '<p>$1</p>');
}

// Initialize the button when the page loads
console.log('Initializing Policy Analyzer...');
createAnalyzeButton(); 