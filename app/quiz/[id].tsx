import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ContentService } from '@/services/content.service';
import { useProgressStore } from '@/store/progress.store';
import { useDatabase } from '@/hooks/useDatabase';

type QuizState = 'question' | 'feedback' | 'results';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const db = useDatabase();
  const setQuizScore = useProgressStore(s => s.setQuizScore);

  const found = ContentService.getLessonById(id);
  const quiz = found?.lesson.quiz;

  const [state, setState] = useState<QuizState>('question');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: boolean }[]>([]);

  if (!found || !quiz) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Typography variant="h3" muted>Quiz no encontrado</Typography>
      </View>
    );
  }

  const { course, lesson } = found;
  // Capturamos el quiz aquí para que TypeScript lo infiera como no-undefined en closures
  const activeQuiz = quiz;
  const question = activeQuiz.preguntas[currentQ];
  const totalQ = activeQuiz.preguntas.length;
  const isLastQ = currentQ === totalQ - 1;

  function handleSelectAnswer(idx: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setState('feedback');
  }

  function handleNext() {
    const correct = selectedAnswer === question.respuesta_correcta;
    const newAnswers = [
      ...answers,
      { questionId: question.id, selected: selectedAnswer!, correct },
    ];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (isLastQ) {
      const score = newAnswers.filter(a => a.correct).length;
      setQuizScore(activeQuiz.id, score);
      saveQuizResult(newAnswers, score);
      setState('results');
    } else {
      setCurrentQ(q => q + 1);
      setState('question');
    }
  }

  async function saveQuizResult(
    ans: { questionId: string; selected: number; correct: boolean }[],
    score: number
  ) {
    try {
      await db.runAsync(
        `INSERT INTO quiz_results (id, quiz_id, lesson_id, course_id, score, total_questions, answers)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          `${Date.now()}`,
          activeQuiz.id,
          lesson.id,
          course.id,
          score,
          totalQ,
          JSON.stringify(ans),
        ]
      );
    } catch (e) {
      // silencioso — el score ya está en el store
    }
  }

  const correctCount = answers.filter(a => a.correct).length;
  const finalScore = state === 'results' ? correctCount : 0;
  const scorePercent = totalQ > 0 ? Math.round((finalScore / totalQ) * 100) : 0;

  // ── PANTALLA DE RESULTADOS ──
  if (state === 'results') {
    const isPerfect = scorePercent === 100;
    const isGood = scorePercent >= 70;
    const resultColor = isPerfect ? Colors.accent : isGood ? Colors.success : Colors.error;
    const resultIcon = isPerfect ? 'trophy' : isGood ? 'checkmark-circle' : 'refresh-circle';
    const resultMsg = isPerfect
      ? '¡Perfecto! Dominaste esta lección.'
      : isGood
      ? '¡Muy bien! Sigue así.'
      : 'Sigue repasando el contenido.';

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Score circle */}
          <View style={[styles.scoreCircle, { borderColor: resultColor, backgroundColor: `${resultColor}15` }]}>
            <Ionicons name={resultIcon as React.ComponentProps<typeof Ionicons>['name']} size={48} color={resultColor} />
            <Typography variant="display" color={resultColor}>{scorePercent}%</Typography>
            <Typography variant="body" secondary>
              {finalScore}/{totalQ} correctas
            </Typography>
          </View>

          <Typography variant="h2" center style={{ color: theme.text, marginTop: 16 }}>
            {resultMsg}
          </Typography>

          {/* Resumen de respuestas */}
          <View style={styles.answerReview}>
            <Typography variant="h3" style={{ color: theme.text, marginBottom: 12 }}>
              Revisión de respuestas
            </Typography>
            {activeQuiz.preguntas.map((q, idx) => {
              const ans = answers[idx];
              const wasCorrect = ans?.correct;
              return (
                <View
                  key={q.id}
                  style={[
                    styles.answerCard,
                    { backgroundColor: theme.card },
                    wasCorrect ? styles.correctCard : styles.wrongCard,
                    Shadows.sm,
                  ]}
                >
                  <View style={styles.answerCardHeader}>
                    <Ionicons
                      name={wasCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={wasCorrect ? Colors.success : Colors.error}
                    />
                    <Typography variant="label" style={{ color: theme.text, flex: 1 }} numberOfLines={2}>
                      {q.pregunta}
                    </Typography>
                  </View>
                  <View style={[styles.explanationBox, { backgroundColor: `${wasCorrect ? Colors.success : Colors.info}12` }]}>
                    <Typography variant="caption" style={{ color: theme.text, lineHeight: 18 }}>
                      {q.explicacion}
                    </Typography>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Acciones */}
          <View style={styles.resultActions}>
            <Button
              label="Volver a la lección"
              onPress={() => router.back()}
              variant="secondary"
              fullWidth
              iconLeft={<Ionicons name="arrow-back" size={18} color={Colors.primary} />}
            />
            {!isPerfect && (
              <Button
                label="Intentar de nuevo"
                onPress={() => {
                  setCurrentQ(0);
                  setSelectedAnswer(null);
                  setAnswers([]);
                  setState('question');
                }}
                variant="ghost"
                fullWidth
                iconLeft={<Ionicons name="refresh" size={18} color={Colors.primary} />}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PANTALLA DE PREGUNTA ──
  const answered = selectedAnswer !== null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <ProgressBar progress={((currentQ) / totalQ) * 100} color={course.banner_color} height={4} />
        </View>
        <Typography variant="label" secondary>
          {currentQ + 1}/{totalQ}
        </Typography>
      </View>

      <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
        {/* Cabecera del quiz */}
        <View style={styles.quizHeader}>
          <View style={[styles.quizBadge, { backgroundColor: `${course.banner_color}20` }]}>
            <Ionicons name="help-circle" size={16} color={course.banner_color} />
            <Typography variant="label" color={course.banner_color}>Quiz · {lesson.titulo}</Typography>
          </View>
          <Typography variant="h2" style={{ color: theme.text, lineHeight: 34 }}>
            {question.pregunta}
          </Typography>
        </View>

        {/* Opciones */}
        <View style={styles.options}>
          {question.opciones.map((opcion, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === question.respuesta_correcta;

            const iconName: React.ComponentProps<typeof Ionicons>['name'] = answered
              ? isCorrect ? 'checkmark-circle' : isSelected ? 'close-circle' : 'ellipse-outline'
              : isSelected ? 'radio-button-on' : 'ellipse-outline';

            const textColor: string = answered
              ? isCorrect ? Colors.success : isSelected ? Colors.error : theme.text
              : theme.text;

            const dynamicStyle = answered
              ? isCorrect
                ? { borderColor: Colors.success, backgroundColor: `${Colors.success}12` }
                : isSelected
                ? { borderColor: Colors.error, backgroundColor: `${Colors.error}10` }
                : { opacity: 0.5 }
              : isSelected
              ? { borderWidth: 2, borderColor: course.banner_color }
              : {};

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, { backgroundColor: theme.card, borderColor: theme.border }, dynamicStyle]}
                onPress={() => handleSelectAnswer(idx)}
                disabled={answered}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={iconName}
                  size={20}
                  color={
                    answered
                      ? isCorrect ? Colors.success : isSelected ? Colors.error : theme.textMuted
                      : isSelected ? course.banner_color : theme.textMuted
                  }
                />
                <Typography variant="body" style={{ color: textColor, flex: 1, lineHeight: 22 }}>
                  {opcion}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {answered && (
          <View
            style={[
              styles.feedback,
              {
                backgroundColor:
                  selectedAnswer === question.respuesta_correcta
                    ? `${Colors.success}15`
                    : `${Colors.error}15`,
                borderColor:
                  selectedAnswer === question.respuesta_correcta
                    ? `${Colors.success}35`
                    : `${Colors.error}35`,
              },
            ]}
          >
            <View style={styles.feedbackHeader}>
              <Ionicons
                name={selectedAnswer === question.respuesta_correcta ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={selectedAnswer === question.respuesta_correcta ? Colors.success : Colors.error}
              />
              <Typography
                variant="h4"
                color={selectedAnswer === question.respuesta_correcta ? Colors.success : Colors.error}
              >
                {selectedAnswer === question.respuesta_correcta ? '¡Correcto!' : 'Incorrecto'}
              </Typography>
            </View>
            <Typography variant="body" style={{ color: theme.text, lineHeight: 22 }}>
              {question.explicacion}
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      {answered && (
        <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <Button
            label={isLastQ ? 'Ver resultados' : 'Siguiente pregunta'}
            onPress={handleNext}
            fullWidth
            size="lg"
            iconRight={
              <Ionicons
                name={isLastQ ? 'trophy-outline' : 'arrow-forward'}
                size={18}
                color="#FFF"
              />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  topCenter: { flex: 1 },
  quizScroll: { paddingBottom: 24 },
  quizHeader: { padding: Spacing.lg, gap: 14 },
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  options: { paddingHorizontal: Spacing.lg, gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: 12,
  },
  feedback: {
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 10,
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bottomBar: {
    padding: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  // Results
  resultsContainer: { padding: Spacing.lg, paddingBottom: 40, alignItems: 'center' },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4,
  },
  answerReview: { width: '100%', marginTop: 32 },
  answerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  correctCard: { borderColor: `${Colors.success}30` },
  wrongCard: { borderColor: `${Colors.error}25` },
  answerCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  explanationBox: {
    padding: 10,
    borderRadius: BorderRadius.sm,
  },
  resultActions: { width: '100%', marginTop: 24, gap: 10 },
});
