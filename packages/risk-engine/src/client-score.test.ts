import { describe, expect, it } from 'vitest';
import { calculateClientScore, WEIGHTS, type AssessmentInput, type PortfolioFacts } from './client-score';
const input:AssessmentInput={incomeSource:{monthlyIncome:'100.00',monthlyExpense:'50.00',monthlyDebtPayment:'0',stability:'STABLE'},socialAcceptance:{rating:10},houseInfrastructure:{structure:'DURABLE',condition:'GOOD',basicUtilities:true}};
const facts:PortfolioFacts={transactionHistory:{dueInstallments:10,missedInstallments:0,principalAmount:'10000',overdueAmount:'0'},savings:{balance:'300',monthlyInstallment:'100'}};
describe('versioned client scoring',()=>{
 it('uses the approved weights',()=>expect(WEIGHTS).toEqual({incomeSource:50,socialAcceptance:10,transactionHistory:20,savings:10,houseInfrastructure:10}));
 it('is deterministic and higher-is-better',()=>{const score=calculateClientScore(input,facts);expect(score).toEqual(calculateClientScore(input,facts));expect(score.totalScore).toBe('100.00');expect(score.classification).toBe('RISK_FREE_LOAN');expect(score.demo).toBe(true);});
 it('classifies exactly 80',()=>{const score=calculateClientScore({...input,incomeSource:{...input.incomeSource,monthlyExpense:'75'}},facts);expect(score.totalScore).toBe('80.00');expect(score.classification).toBe('RISK_FREE_LOAN');});
 it('classifies 79.99 below the recommendation threshold',()=>{const score=calculateClientScore({...input,incomeSource:{...input.incomeSource,monthlyExpense:'75.01'}},facts);expect(score.totalScore).toBe('79.99');expect(score.classification).toBe('REVIEW_REQUIRED');});
 it('classifies exactly 60',()=>{const score=calculateClientScore({...input,incomeSource:{...input.incomeSource,monthlyExpense:'100'}},facts);expect(score.totalScore).toBe('60.00');expect(score.classification).toBe('REVIEW_REQUIRED');});
 it('classifies 59.99 as higher risk',()=>{const score=calculateClientScore({...input,incomeSource:{...input.incomeSource,monthlyExpense:'100'}},{...facts,savings:{balance:'299.70',monthlyInstallment:'100'}});expect(score.totalScore).toBe('59.99');expect(score.classification).toBe('HIGHER_RISK');});
 for(const category of ['incomeSource','socialAcceptance','houseInfrastructure'] as const)it(`does not reweight missing ${category}`,()=>{const result=calculateClientScore({...input,[category]:undefined},facts);expect(result.totalScore).toBeNull();expect(result.classification).toBe('INCOMPLETE');expect(result.missingCategories).toContain(category);});
 it('treats absent history as incomplete',()=>expect(calculateClientScore(input,{}).missingCategories).toEqual(['transactionHistory','savings']));
 it('distinguishes recorded zero savings from missing savings',()=>expect(calculateClientScore(input,{...facts,savings:{balance:'0',monthlyInstallment:'100'}}).categories.find(c=>c.key==='savings')?.score).toBe('0.00'));
 it('does not reward zero income',()=>expect(calculateClientScore({...input,incomeSource:{...input.incomeSource,monthlyIncome:'0'}},facts).categories[0]?.score).toBe('0.00'));
 it('preserves four-place weighted contributions',()=>expect(calculateClientScore(input,facts).categories[0]?.weightedContribution).toBe('50.0000'));
 it('rejects malformed monetary values as incomplete',()=>expect(calculateClientScore({...input,incomeSource:{...input.incomeSource,monthlyIncome:'1e9'}},facts).totalScore).toBeNull());
 it('treats no due schedules as incomplete, not perfect history',()=>expect(calculateClientScore(input,{...facts,transactionHistory:{...facts.transactionHistory!,dueInstallments:0}}).totalScore).toBeNull());
});
