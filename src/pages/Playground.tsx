import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Save, Sparkles, Settings, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAppStore } from '@/store/useAppStore';
import { getPlaygroundHistory, listPlaygroundHistory, runPlayground } from '@/lib/api/j/playground';
import { fetchModels } from '@/lib/api/j/models';
import type { PlaygroundHistorySummary } from '@/types/playground';
import type { ModelSummary } from '@/types/model';

const ALLOWED_MODEL_IDS = [1, 17];

export function Playground() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [history, setHistory] = useState<PlaygroundHistorySummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadModels = useCallback(async () => {
    try {
      const response = await fetchModels({ active: true, limit: 20 });
      const allowed = response.items.filter((item) => ALLOWED_MODEL_IDS.includes(item.id));
      setModels(allowed);
      if (allowed.length === 0) {
        setSelectedModelId(null);
      } else if (!selectedModelId || !allowed.some((item) => item.id === selectedModelId)) {
        setSelectedModelId(allowed[0].id);
      }
    } catch (error) {
      console.error('모델 목록을 불러오지 못했습니다.', error);
      setErrorMessage('모델 목록을 불러오는 중 오류가 발생했습니다.');
    }
  }, [selectedModelId]);

  const loadHistory = useCallback(async () => {
    try {
      const response = await listPlaygroundHistory({ limit: 10 });
      setHistory(response.items);
    } catch (error) {
      console.error('히스토리를 불러오지 못했습니다.', error);
      setErrorMessage('히스토리를 불러오는 중 오류가 발생했습니다.');
    }
  }, []);

  useEffect(() => {
    loadModels();
    loadHistory();
  }, [loadModels, loadHistory]);

  const handleRun = async () => {
    if (!input.trim() || !selectedModelId) return;

    setIsRunning(true);
    setOutput('');
    setErrorMessage(null);

    try {
      const response = await runPlayground({
        prompt_text: input,
        model_id: selectedModelId,
        model_params: {
          temperature,
          max_token: maxTokens,
        },
        analyzer: {
          enabled: true,
        },
      });

      setOutput(response.output);
      await loadHistory();
    } catch (error) {
      console.error('Playground 실행 실패:', error);
      setErrorMessage('실행 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleLoadHistory = async (historyId: number) => {
    try {
      const detail = await getPlaygroundHistory(historyId);
      setInput(detail.test_content);
      setOutput(detail.output);
      if (detail.model_id) {
        setSelectedModelId(detail.model_id);
      }
    } catch (error) {
      console.error('히스토리를 불러오지 못했습니다.', error);
      setErrorMessage('선택한 실행 기록을 불러오지 못했습니다.');
    }
  };

  const navigate = useNavigate();
  const setSelectedPromptId = useAppStore((state) => state.setSelectedPromptId);
  const setDraftPromptContent = useAppStore((state) => state.setDraftPromptContent);

  const handleSaveAsPrompt = () => {
    if (!input.trim()) return;
    setDraftPromptContent(input);
    setSelectedPromptId(null);
    navigate('/editor');
  };

  return (
    <div className="min-h-screen gradient-dark-bg gradient-overlay">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <h1 className="text-base sm:text-lg lg:text-xl">Playground</h1>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Select
                value={selectedModelId ? String(selectedModelId) : undefined}
                onValueChange={(value) => {
                  setSelectedModelId(Number(value));
                }}
              >
                <SelectTrigger className="w-24 sm:w-32 lg:w-40 text-xs sm:text-sm">
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleRun}
                disabled={isRunning || !input.trim() || !selectedModelId}
                className="glow-primary bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Play className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Prompt Input</CardTitle>
                <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 space-y-4 pt-4 border-t border-border">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="temp">Temperature</Label>
                          <span className="text-sm text-muted-foreground">{temperature}</span>
                        </div>
                        <Slider
                          id="temp"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[temperature]}
                          onValueChange={(value) => setTemperature(value[0])}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="tokens">Max Tokens</Label>
                          <span className="text-sm text-muted-foreground">{maxTokens}</span>
                        </div>
                        <Slider
                          id="tokens"
                          min={100}
                          max={4000}
                          step={100}
                          value={[maxTokens]}
                          onValueChange={(value) => setMaxTokens(value[0])}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your prompt here... Try describing what you want the AI to do."
                  className="min-h-[500px] font-mono text-sm resize-none"
                />
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSaveAsPrompt}
                    disabled={!input.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
                  {errorMessage && (
                    <div className="mb-4 text-sm text-red-400">
                      {errorMessage}
                    </div>
                  )}
                  {output ? (
                    <div className="whitespace-pre-wrap text-sm">
                      {output}
                      {isRunning && (
                        <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse"></span>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm text-center py-12">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Enter a prompt and click "Run" to see the output</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <Card className="mt-8 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Executions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Model #{item.model_id}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.tested_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Input</p>
                        <div className="bg-card p-2 rounded text-sm font-mono max-h-20 overflow-hidden">
                          {typeof item.summary?.input_len === 'number' ? `${item.summary.input_len} chars` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Output</p>
                        <div className="bg-card p-2 rounded text-sm max-h-20 overflow-hidden">
                          {typeof item.summary?.output_len === 'number' ? `${item.summary.output_len} chars` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLoadHistory(item.id)}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
