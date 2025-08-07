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
    Loader2, Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {codeSnippets, ollamaModels, errorMessageTypes, type ErrorMessageType} from '@/data/codeSnippets';
import {FeedbackForm} from './FeedbackForm';
import ollama from 'ollama';
import {promptTemplates, systemPrompts} from '@/lib/promptTemplates';
import {toast} from '@/hooks/use-toast';

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
    const [activeErrorTab, setActiveErrorTab] = useState<string>("standard");

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
            // Format the prompt using the template
            const promptTemplate = promptTemplates[errorMessageType];
            const formattedPrompt = promptTemplate
                .replace('{{code}}', activeSnippet.code)
                .replace('{{error}}', activeSnippet.standardError);

            const systemPrompt = systemPrompts[selectedModel];

            // Call Ollama API using the selected model
            const response = await ollama.generate({
                model: selectedModel,
                system: systemPrompt,
                prompt: formattedPrompt,
                options: {
                    temperature: 0.0
                }
            });

            // Create a new ImprovedError object
            const improvedError: ImprovedError = {
                snippetId: activeTab,
                content: response.response,
                type: errorMessageType,
                model: selectedModel,
            };

            setImprovedErrors(prev => [...prev.filter(e => getErrorKey(e.snippetId, e.type, e.model) !== getErrorKey(activeTab, errorMessageType, selectedModel)), improvedError]);
            setShowErrorPanel(true); // Open the error panel
            setActiveErrorTab('improved'); // Switch to improved error tab
        } catch (err) {
            // Optionally handle error
        } finally {
            setIsGenerating(false);
        }
    }, [activeTab, errorMessageType, selectedModel, canGenerateError, activeSnippet]);

    // Utility to store feedback in localStorage
    function storeFeedbackLocally(feedback: Record<string, string>) {
        const key = 'codeEditorFeedback';
        const existing = localStorage.getItem(key);
        const arr = existing ? JSON.parse(existing) : [];
        arr.push(feedback);
        localStorage.setItem(key, JSON.stringify(arr));
    }

    // Utility to download feedback as CSV
    function downloadFeedbackCSV() {
        const key = 'codeEditorFeedback';
        const existing = localStorage.getItem(key);
        if (!existing) return;
        const arr = JSON.parse(existing);
        if (!arr.length) return;
        const headers = Object.keys(arr[0]);
        const csvRows = [headers.join(",")].concat(
            arr.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
        );
        const csv = csvRows.join("\n");
        const blob = new Blob([csv], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'feedback.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Handle feedback submission
    const handleFeedbackSubmit = useCallback((answers: Record<string, boolean>) => {
        const errorKey = getErrorKey(activeTab, errorMessageType, selectedModel);
        setFeedbackGiven(prev => new Set([...prev, errorKey]));
        setShowFeedbackTab(false);

        // Flatten answers into top-level properties for easier CSV parsing
        const feedback: Record<string, string> = {
            snippetId: activeTab,
            snippetName: activeSnippet.name,
            errorType: errorMessageType,
            model: selectedModel,
            timestamp: new Date().toISOString(),
            ...answers // Each answer key becomes a column
        };
        try {
            storeFeedbackLocally(feedback);
            toast({
                title: 'Feedback submitted',
                description: 'Thank you for your feedback!',
                variant: 'success',
            });
        } catch (err) {
            toast({
                title: 'Feedback error',
                description: 'Failed to submit feedback. Please try again.',
                variant: 'destructive',
            });
        }
        // We just log the feedback here, no need for an API call in this example
        console.log('Feedback submitted:', feedback);
    }, [activeTab, errorMessageType, selectedModel]);

    // Handle tab change and manage error panel visibility
    function handleTabChange(snippetId: string) {
        setActiveTab(snippetId);
        // Only close the error panel if we were viewing the improved error tab and the new snippet does not have an improved error
        const prevHasImprovedError = improvedErrors.some(e => e.snippetId === activeTab && e.type === errorMessageType && e.model === selectedModel);
        const newHasImprovedError = improvedErrors.some(e => e.snippetId === snippetId && e.type === errorMessageType && e.model === selectedModel);
        const isOnImprovedTab = activeErrorTab === 'improved';
        if (isOnImprovedTab && prevHasImprovedError && !newHasImprovedError) {
            setShowErrorPanel(false);
            setActiveErrorTab('standard');
        }
    }

    const handleErrorMessageTypeChange = (type: ErrorMessageType) => {
        setErrorMessageType(type);
        // Check if the new error type has an improved error for the current tab and model
        const hasImprovedError = improvedErrors.some(e => e.snippetId === activeTab && e.type === type && e.model === selectedModel);
        if (!hasImprovedError) {
            setShowErrorPanel(false); // Close the entire panel if no improved error for the selected type
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-background">
            {/* Top Tabs */}
            <div className="flex bg-toolbar border-b border-border shrink-0">
                {codeSnippets.map((snippet) => (
                    <button
                        key={snippet.id}
                        onClick={() => handleTabChange(snippet.id)}
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
            <div className="flex-1 flex flex-col min-h-0 max-h-full overflow-hidden">
                {!showFeedbackTab ? (
                    <>
                        {/* Code Editor */}
                        <div className="flex-1 bg-editor min-h-0 max-h-full overflow-hidden">
                            <div style={{maxHeight: '100%', height: '100%', overflowY: 'auto'}}>
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
                        </div>

                        {/* Error Panel */}
                        {showErrorPanel && (
                            <Card className="bg-panel border-t border-border shadow-panel">
                                <Tabs value={activeErrorTab} onValueChange={setActiveErrorTab} className="p-4">
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
                                            className="bg-error text-destructive-foreground p-4 rounded-md border border-error-border text-sm font-mono whitespace-pre-wrap max-h-60 overflow-auto">
                                          {activeSnippet.standardError}
                                        </pre>
                                    </TabsContent>

                                    {currentImprovedError && (
                                        <TabsContent value="improved" className="mt-4">
                                            <div
                                                className="bg-success/10 text-foreground p-4 rounded-md border border-success/20 prose prose-sm prose-invert max-w-none max-h-60 overflow-auto">
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
                    <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 max-h-full overflow-hidden">
                        <ResizablePanel defaultSize={60} minSize={30} className="min-h-0 max-h-full overflow-hidden">
                            <div className="flex flex-col h-full min-h-0 max-h-full overflow-hidden">
                                {/* Code Editor */}
                                <div className="flex-1 bg-editor min-h-0 max-h-full overflow-hidden">
                                    <div style={{maxHeight: '100%', height: '100%', overflowY: 'auto'}}>
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
                                </div>

                                {/* Error Panel */}
                                {showErrorPanel && (
                                    <Card className="bg-panel border-t border-border shadow-panel">
                                        <Tabs value={activeErrorTab} onValueChange={setActiveErrorTab} className="p-4">
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
                                                    className="bg-error text-destructive-foreground p-4 rounded-md border border-error-border text-sm font-mono whitespace-pre-wrap max-h-60 overflow-auto">
                                                    {activeSnippet.standardError}
                                                </pre>
                                            </TabsContent>

                                            {currentImprovedError && (
                                                <TabsContent value="improved" className="mt-4">
                                                    <div
                                                        className="bg-success/10 text-foreground p-4 rounded-md border border-success/20 prose prose-sm prose-invert max-w-none max-h-60 overflow-auto">
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

                        <ResizablePanel defaultSize={40} minSize={30} className="min-h-0 max-h-full overflow-hidden">
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
                <div className="flex items-center gap-4 p-4 bg-toolbar border-t border-border shrink-0">
                    {/* Left-side buttons */}
                    <div className="flex items-center gap-4">
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
                                        onClick={() => handleErrorMessageTypeChange(type)}
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
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setActiveErrorTab('standard'); // Reset to standard tab on model change
                                            setShowErrorPanel(false); // Close error panel when model changes
                                        }}
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
                    {/* Spacer */}
                    <div className="flex-1"/>
                    {/* Right-side download button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadFeedbackCSV}
                        className="flex items-center gap-2 ml-auto"
                    >
                        <Download className="w-4 h-4"/>
                        Download Feedback CSV
                    </Button>
                </div>
            </div>
        </div>
    );
}
