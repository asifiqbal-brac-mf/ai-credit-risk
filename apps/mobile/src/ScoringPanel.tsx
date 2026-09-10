import { View, Text, StyleSheet } from 'react-native';
import { AssessmentPanel as ExistingAssessmentPanel, Scores as ExistingScores } from './AssessmentPanel';
export type { AssessmentBundle, ScoreResult } from './AssessmentPanel';
export const AssessmentPanel = ExistingAssessmentPanel;
export function Scores({bundle,viewerRole}:{bundle?:import('./AssessmentPanel').AssessmentBundle;viewerRole?:string}) {
  const effectiveRole = viewerRole || bundle?.canonical?.role;
  const displayBundle = effectiveRole === 'CDO' && bundle ? {...bundle,bm:null} : effectiveRole === 'BM' && bundle ? {...bundle,cdo:null} : bundle;
  const score = Number(bundle?.canonical?.result.totalScore ?? bundle?.cdo?.result.totalScore);
  const suggestion = Number.isFinite(score) && score > 0
    ? score >= 80 ? 'Up to 80% of proposed amount'
      : score >= 60 ? 'Up to 60% of proposed amount'
        : 'No risk-free amount suggested'
    : 'Incomplete assessment — score required';
  return <View><ExistingScores bundle={displayBundle}/><View style={styles.card}><Text style={styles.title}>Risk-free loan suggestion</Text><Text>{suggestion}</Text><Text style={styles.note}>Advisory only. Final approval remains with the authorized reviewer.</Text></View></View>;
}
const styles=StyleSheet.create({card:{padding:12,marginVertical:8,borderRadius:10,backgroundColor:'#e0eee6'},title:{fontSize:17,fontWeight:'700',marginBottom:5},note:{marginTop:5,color:'#687972'}});
