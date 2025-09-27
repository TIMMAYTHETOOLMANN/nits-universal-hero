import { useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { CustomPattern, AnalysisResult, AutonomousPattern, TrainingStatus } from '../types';

// Fixed Spark API type declaration with complete interface
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
    };
  }
}

export function useAutonomousTraining() {
  const [autoTrainingEnabled, setAutoTrainingEnabled] = useKV<boolean>('auto-training-enabled', false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);
  const [lastAutoTraining, setLastAutoTraining] = useKV<string | null>('last-auto-training', null);
  const [autonomousPatterns, setAutonomousPatterns] = useKV<AutonomousPattern[]>('autonomous-patterns', []);
  const [trainingStatus, setTrainingStatus] = useKV<TrainingStatus | null>('training-status', null);

  const addToTrainingLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTrainingLog(prev => [...prev, `[${timestamp}] ${message}`]);
    
    // Also update training status log
    setTrainingStatus(current => ({
      ...current,
      isActive: current?.isActive || false,
      currentPhase: current?.currentPhase || 'Idle',  
      progress: current?.progress || 0,
      patternsGenerated: current?.patternsGenerated || 0,
      lastTrainingTime: current?.lastTrainingTime || null,
      trainingLog: [...(current?.trainingLog || []), `[${timestamp}] ${message}`]
    }));
  }, [setTrainingStatus]);

  const updateTrainingStatus = useCallback((updates: Partial<TrainingStatus>) => {
    setTrainingStatus(current => ({
      isActive: false,
      currentPhase: 'Idle',
      progress: 0,
      patternsGenerated: 0,
      lastTrainingTime: null,
      trainingLog: [],
      ...current,
      ...updates
    }));
  }, [setTrainingStatus]);

  const getActivePatterns = useCallback(() => {
    return autonomousPatterns?.filter(pattern => pattern.isActive) || [];
  }, [autonomousPatterns]);

  const togglePattern = useCallback((patternId: string) => {
    setAutonomousPatterns(current => 
      current?.map(pattern => 
        pattern.id === patternId 
          ? { ...pattern, isActive: !pattern.isActive }
          : pattern
      ) || []
    );
  }, [setAutonomousPatterns]);

  const deletePattern = useCallback((patternId: string) => {
    setAutonomousPatterns(current => 
      current?.filter(pattern => pattern.id !== patternId) || []
    );
  }, [setAutonomousPatterns]);

  const clearTrainingLog = useCallback(() => {
    setTrainingLog([]);
    setTrainingStatus(current => ({
      ...current,
      isActive: current?.isActive || false,
      currentPhase: current?.currentPhase || 'Idle',  
      progress: current?.progress || 0,
      patternsGenerated: current?.patternsGenerated || 0,
      lastTrainingTime: current?.lastTrainingTime || null,
      trainingLog: []
    }));
  }, [setTrainingStatus]);

  const generateAutonomousPatterns = useCallback(async (
    analysisResults: AnalysisResult,
    consoleLogger: (message: string) => void
  ) => {
    if (isTraining) return;
    
    setIsTraining(true);
    updateTrainingStatus({
      isActive: true,
      currentPhase: 'Initializing Auto-Training',
      progress: 0
    });

    try {
      updateTrainingStatus({
        currentPhase: 'Analyzing Violations',
        progress: 25
      });

      if (!analysisResults.violations || analysisResults.violations.length === 0) {
        addToTrainingLog('No violations found to train on');
        consoleLogger('AI Training: No violations available for pattern generation');
        return;
      }

      const prompt = window.spark.llmPrompt`
        Analyze these SEC violations and generate 3-5 advanced detection patterns:
        
        Violations: ${JSON.stringify(analysisResults.violations.slice(0, 3))}
        
        Generate patterns that detect:
        1. Keyword combinations and phrases
        2. Context patterns (surrounding text indicators)
        3. Timing and disclosure patterns
        4. Performance optimization patterns
        
        Return JSON format:
        {
          "patterns": [
            {
              "name": "Pattern Name",
              "violationType": "Type of violation",
              "keywords": ["keyword1", "keyword2"],
              "confidence": 0.85
            }
          ]
        }
      `;

      const aiResponse = await window.spark.llm(prompt, "gpt-4o", true);
      const aiPatterns = JSON.parse(aiResponse);

      updateTrainingStatus({
        currentPhase: 'Generating Optimized Patterns',
        progress: 75
      });

      const newPatterns: AutonomousPattern[] = aiPatterns.patterns.map((pattern: any, index: number) => ({
        id: `auto-${Date.now()}-${index}`,
        name: pattern.name || `Auto Pattern ${index + 1}`,
        violationType: pattern.violationType || 'General',
        keywords: pattern.keywords || [],
        confidence: pattern.confidence || 0.8,
        performance: 0.85,
        isActive: true,
        generatedAt: new Date().toISOString(),
        source: 'autonomous' as const
      }));

      const existingPatterns = autonomousPatterns || [];
      const uniquePatterns = newPatterns.filter(newPattern => 
        !existingPatterns.some(existingPattern => 
          JSON.stringify(existingPattern.keywords.sort()) === JSON.stringify(newPattern.keywords.sort())
        )
      );

      if (uniquePatterns.length > 0) {
        setAutonomousPatterns(current => [...(current || []), ...uniquePatterns]);
        addToTrainingLog(`Generated ${uniquePatterns.length} new patterns`);
        consoleLogger(`AI Training: Generated ${uniquePatterns.length} new autonomous patterns`);
      } else {
        addToTrainingLog('No new unique patterns generated');
        consoleLogger('AI Training: No new unique patterns generated');
      }

      updateTrainingStatus({
        currentPhase: 'Training Complete',
        progress: 100,
        patternsGenerated: (trainingStatus?.patternsGenerated || 0) + uniquePatterns.length,
        lastTrainingTime: new Date().toISOString()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addToTrainingLog(`Training error: ${errorMessage}`);
      consoleLogger(`AI Training Error: ${errorMessage}`);
      updateTrainingStatus({
        currentPhase: 'Training Failed',
        progress: 0
      });
    } finally {
      setTimeout(() => {
        setIsTraining(false);
        updateTrainingStatus({
          isActive: false,
          progress: 0
        });
      }, 2000);
    }
  }, [isTraining, autonomousPatterns, trainingStatus, setAutonomousPatterns, updateTrainingStatus, addToTrainingLog]);

  const performAutonomousTraining = useCallback(async (
    analysisResults: AnalysisResult | undefined,
    existingPatterns: CustomPattern[],
    onPatternsGenerated: (patterns: CustomPattern[]) => void,
    onPatternOptimized: (id: string, updates: Partial<CustomPattern>) => void,
    onPatternTested: (id: string) => Promise<void>
  ) => {
    if (isTraining) return;
    
    setIsTraining(true);
    addToTrainingLog('Starting autonomous pattern training session...');

    try {
      // Generate autonomous patterns if we have analysis results
      if (analysisResults) {
        await generateAutonomousPatterns(analysisResults, addToTrainingLog);
      }

      setLastAutoTraining(new Date().toISOString());
      
    } catch (error) {
      addToTrainingLog('Autonomous training failed - manual intervention may be required');
    } finally {
      setIsTraining(false);
    }
  }, [isTraining, addToTrainingLog, generateAutonomousPatterns]);

  return {
    autoTrainingEnabled,
    setAutoTrainingEnabled,
    isTraining,
    trainingLog,
    lastAutoTraining,
    autonomousPatterns,
    trainingStatus,
    getActivePatterns,
    togglePattern,
    deletePattern,
    generateAutonomousPatterns,
    performAutonomousTraining,
    addToTrainingLog,
    clearTrainingLog
  };
}