import {useState, useCallback} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {python} from '@codemirror/lang-python';
import {oneDark} from '@codemirror/theme-one-dark';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card} from '@/components/ui/card';
import {ResizablePanelGroup, ResizablePanel, ResizableHandle} from '@/components/ui/resizable';
import {
    ChevronDown,
    Terminal,
    Sparkles,
    MessageSquare,
    X,
    Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {codeSnippets, ollamaModels, errorMessageTypes, type ErrorMessageType} from '@/data/codeSnippets';
import {FeedbackForm} from './FeedbackForm';

interface ImprovedError {
    snippetId: string;
    content: string;
    type: ErrorMessageType;
    model: string;
}

export function CodeEditor() {
    const [activeTab, setActiveTab] = useState(codeSnippets[0].id);
    const [showErrorPanel, setShowErrorPanel] = useState(false);
    const [errorMessageType, setErrorMessageType] = useState<ErrorMessageType>('pragmatic');
    const [selectedModel, setSelectedModel] = useState(ollamaModels[0]);
    const [improvedErrors, setImprovedErrors] = useState<ImprovedError[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
    const [showFeedbackTab, setShowFeedbackTab] = useState(false);

    const activeSnippet = codeSnippets.find(s => s.id === activeTab)!;
    const currentImprovedError = improvedErrors.find(
        e => e.snippetId === activeTab && e.type === errorMessageType && e.model === selectedModel
    );

    const canGenerateError = !isGenerating && (!currentImprovedError || feedbackGiven.has(getErrorKey(activeTab, errorMessageType, selectedModel)));

    function getErrorKey(snippetId: string, type: ErrorMessageType, model: string) {
        return `${snippetId}-${type}-${model}`;
    }

    const generateImprovedError = useCallback(async () => {
        if (!canGenerateError) return;

        setIsGenerating(true);
        try {
            // Simulate API call to Ollama
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockImprovedError: ImprovedError = {
                snippetId: activeTab,
                content: `## ${errorMessageType === 'pragmatic' ? 'Pragmatic' : 'Contingent'} Error Analysis

**Error Type:** \`IndexError\`

**What went wrong:** Your code tried to access item #5 in a list that only has 3 items (positions 0, 1, and 2).

**Why this happened:** Lists in Python start counting from 0, so a list with 3 items has valid positions 0, 1, and 2. Position 5 doesn't exist.

**How to fix it:**
\`\`\`python
# Option 1: Check if index is valid
def get_item(items, index):
    if index < len(items):
        return items[index]
    else:
        return None  # or handle the error appropriately

# Option 2: Use try-except
def get_item(items, index):
    try:
        return items[index]
    except IndexError:
        return None  # or a default value
\`\`\`

**Prevention tip:** Always check that your index is less than \`len(your_list)\` before accessing list items.`,
                type: errorMessageType,
                model: selectedModel
            };

            setImprovedErrors(prev => {
                const filtered = prev.filter(e =>
                    !(e.snippetId === activeTab && e.type === errorMessageType && e.model === selectedModel)
                );
                return [...filtered, mockImprovedError];
            });

            // Remove feedback status for this error combination
            const errorKey = getErrorKey(activeTab, errorMessageType, selectedModel);
            setFeedbackGiven(prev => {
                const newSet = new Set(prev);
                newSet.delete(errorKey);
                return newSet;
            });

        } catch (error) {
            console.error('Error generating improved message:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [activeTab, errorMessageType, selectedModel, canGenerateError]);

    const handleFeedbackSubmit = useCallback((answers: Record<string, boolean>) => {
        const errorKey = getErrorKey(activeTab, errorMessageType, selectedModel);
        setFeedbackGiven(prev => new Set([...prev, errorKey]));
        setShowFeedbackTab(false);

        // Here you would typically send the feedback to your backend
        console.log('Feedback submitted:', {
            snippetId: activeTab,
            errorType: errorMessageType,
            model: selectedModel,
            answers
        });
    }, [activeTab, errorMessageType, selectedModel]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Top Tabs */}
            <div className="flex bg-toolbar border-b border-border">
                {codeSnippets.map((snippet) => (
                    <button
                        key={snippet.id}
                        onClick={() => setActiveTab(snippet.id)}
                        className={`px-4 py-2 text-sm font-medium border-r border-tab-border transition-colors ${
                            activeTab === snippet.id
                                ? 'bg-tab-active text-foreground'
                                : 'bg-tab text-muted-foreground hover:bg-tab-active/50'
                        }`}
                    >
                        {snippet.name}
                    </button>
                ))}

                {showFeedbackTab && (
                    <button
                        onClick={() => setShowFeedbackTab(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-warning text-warning-foreground border-r border-tab-border"
                    >
                        Feedback Form
                        <X className="w-4 h-4"/>
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {!showFeedbackTab ? (
                    <>
                        {/* Code Editor */}
                        <div className="flex-1 bg-editor">
                            <CodeMirror
                                value={activeSnippet.code}
                                theme={oneDark}
                                extensions={[python()]}
                                editable={false}
                                style={{
                                    fontSize: '14px',
                                    height: '100%'
                                }}
                            />
                        </div>

                        {/* Error Panel */}
                        {showErrorPanel && (
                            <Card className="bg-panel border-t border-border shadow-panel">
                                <Tabs defaultValue="standard" className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <TabsList className="bg-muted">
                                            <TabsTrigger value="standard">Standard Error</TabsTrigger>
                                            {currentImprovedError && (
                                                <TabsTrigger value="improved">Improved Error</TabsTrigger>
                                            )}
                                        </TabsList>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowErrorPanel(false)}
                                        >
                                            <X className="w-4 h-4"/>
                                        </Button>
                                    </div>

                                    <TabsContent value="standard" className="mt-4">
                    <pre
                        className="bg-error text-destructive-foreground p-4 rounded-md border border-error-border text-sm font-mono whitespace-pre-wrap">
                      {activeSnippet.standardError}
                    </pre>
                                    </TabsContent>

                                    {currentImprovedError && (
                                        <TabsContent value="improved" className="mt-4">
                                            <div
                                                className="bg-success/10 text-foreground p-4 rounded-md border border-success/20 prose prose-sm prose-invert max-w-none">
                                                <ReactMarkdown>
                                                    {currentImprovedError.content}
                                                </ReactMarkdown>
                                            </div>
                                        </TabsContent>
                                    )}
                                </Tabs>
                            </Card>
                        )}
                    </>
                ) : (
                    <ResizablePanelGroup direction="horizontal" className="flex-1">
                        <ResizablePanel defaultSize={60} minSize={30}>
                            <div className="flex flex-col h-full">
                                {/* Code Editor */}
                                <div className="flex-1 bg-editor">
                                    <CodeMirror
                                        value={activeSnippet.code}
                                        theme={oneDark}
                                        extensions={[python()]}
                                        editable={false}
                                        style={{
                                            fontSize: '14px',
                                            height: '100%'
                                        }}
                                    />
                                </div>

                                {/* Error Panel */}
                                {showErrorPanel && (
                                    <Card className="bg-panel border-t border-border shadow-panel">
                                        <Tabs defaultValue="standard" className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <TabsList className="bg-muted">
                                                    <TabsTrigger value="standard">Standard Error</TabsTrigger>
                                                    {currentImprovedError && (
                                                        <TabsTrigger value="improved">Improved Error</TabsTrigger>
                                                    )}
                                                </TabsList>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowErrorPanel(false)}
                                                >
                                                    <X className="w-4 h-4"/>
                                                </Button>
                                            </div>

                                            <TabsContent value="standard" className="mt-4">
                        <pre
                            className="bg-error text-destructive-foreground p-4 rounded-md border border-error-border text-sm font-mono whitespace-pre-wrap">
                          {activeSnippet.standardError}
                        </pre>
                                            </TabsContent>

                                            {currentImprovedError && (
                                                <TabsContent value="improved" className="mt-4">
                                                    <div
                                                        className="bg-success/10 text-foreground p-4 rounded-md border border-success/20 prose prose-sm prose-invert max-w-none">
                                                        <ReactMarkdown>
                                                            {currentImprovedError.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </TabsContent>
                                            )}
                                        </Tabs>
                                    </Card>
                                )}
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle/>

                        <ResizablePanel defaultSize={40} minSize={30}>
                            <FeedbackForm
                                snippetName={activeSnippet.name}
                                errorType={errorMessageType}
                                model={selectedModel}
                                onSubmit={handleFeedbackSubmit}
                                onCancel={() => setShowFeedbackTab(false)}
                            />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}

                {/* Bottom Toolbar */}
                <div className="flex items-center gap-4 p-4 bg-toolbar border-t border-border">
                    <Button
                        variant={showErrorPanel ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowErrorPanel(!showErrorPanel)}
                        className="flex items-center gap-2"
                    >
                        <Terminal className="w-4 h-4"/>
                        {showErrorPanel ? 'Hide' : 'Show'} Error
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                Type: {errorMessageType}
                                <ChevronDown className="w-4 h-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-popover">
                            {errorMessageTypes.map((type) => (
                                <DropdownMenuItem
                                    key={type}
                                    onClick={() => setErrorMessageType(type)}
                                    className="capitalize"
                                >
                                    {type}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                Model: {selectedModel}
                                <ChevronDown className="w-4 h-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-popover">
                            {ollamaModels.map((model) => (
                                <DropdownMenuItem
                                    key={model}
                                    onClick={() => setSelectedModel(model)}
                                >
                                    {model}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={generateImprovedError}
                        disabled={!canGenerateError}
                        className="flex items-center gap-2 bg-gradient-primary"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin"/>
                        ) : (
                            <Sparkles className="w-4 h-4"/>
                        )}
                        {isGenerating ? 'Generating...' : 'Improve Error'}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setShowFeedbackTab(true);
                            setShowErrorPanel(true); // Ensure error panel is visible for comparison
                        }}
                        disabled={!currentImprovedError || feedbackGiven.has(getErrorKey(activeTab, errorMessageType, selectedModel))}
                        className="flex items-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4"/>
                        Feedback
                    </Button>
                </div>
            </div>
        </div>
    );
}