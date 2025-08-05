import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Label} from '@/components/ui/label';
import {CheckCircle, XCircle} from 'lucide-react';
import type {ErrorMessageType} from '@/data/codeSnippets';

interface FeedbackFormProps {
    snippetName: string;
    errorType: ErrorMessageType;
    model: string;
    onSubmit: (answers: Record<string, boolean>) => void;
    onCancel: () => void;
}

const feedbackQuestions = [
    {
        id: 'comprehensible',
        question: 'Is the error message comprehensible?'
    },
    {
        id: 'correct',
        question: 'Is the error message correct in its explanation?'
    },
    {
        id: 'improvement',
        question: 'Is the error message an improvement over the standard one?'
    },
    {
        id: 'hasHint',
        question: 'Does the error message contain a hint for a possible fix?'
    },
    {
        id: 'hintCorrect',
        question: 'Is the error message hint actually correct?'
    }
];

export function FeedbackForm({snippetName, errorType, model, onSubmit, onCancel}: FeedbackFormProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const booleanAnswers = Object.fromEntries(
            Object.entries(answers).map(([key, value]) => [key, value === 'yes'])
        );
        onSubmit(booleanAnswers);
    };

    const isComplete = feedbackQuestions.every(q => answers[q.id]);

    return (
        <div className="flex-1 bg-panel p-6 overflow-auto">
            <Card className="max-w-2xl mx-auto bg-card">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                        Feedback Form
                    </CardTitle>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>File: <span className="font-mono">{snippetName}</span></div>
                        <div>Error Type: <span className="capitalize font-medium">{errorType}</span></div>
                        <div>Model: <span className="font-mono">{model}</span></div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Please evaluate the improved error message by answering the following questions:
                    </p>

                    {feedbackQuestions.map((question) => (
                        <div key={question.id} className="space-y-3">
                            <Label className="text-base font-medium">
                                {question.question}
                            </Label>

                            <RadioGroup
                                value={answers[question.id] || ''}
                                onValueChange={(value) => setAnswers(prev => ({...prev, [question.id]: value}))}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id={`${question.id}-yes`}/>
                                    <Label
                                        htmlFor={`${question.id}-yes`}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <CheckCircle className="w-4 h-4 text-success"/>
                                        Yes
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id={`${question.id}-no`}/>
                                    <Label
                                        htmlFor={`${question.id}-no`}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <XCircle className="w-4 h-4 text-destructive"/>
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    ))}

                    <div className="flex gap-4 pt-6 border-t border-border">
                        <Button
                            onClick={handleSubmit}
                            disabled={!isComplete}
                            className="flex-1 bg-gradient-primary"
                        >
                            Submit Feedback
                        </Button>

                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}