/** Versioned DEMO policy, not an approved lending model. Higher is better. */
export const CLIENT_RULE_VERSION = 'demo-client-v1';
export const RECOMMENDATION_NOTICE = 'AI Recommendation — Human Review Required';
export const WEIGHTS = { incomeSource:50, socialAcceptance:10, transactionHistory:20, savings:10, houseInfrastructure:10 } as const;
export type Category = keyof typeof WEIGHTS;
export type AssessmentInput = {
  incomeSource?: { monthlyIncome?:string; monthlyExpense?:string; monthlyDebtPayment?:string; stability?:'STABLE'|'SEASONAL'|'IRREGULAR' };
  socialAcceptance?: { rating?:number };
  houseInfrastructure?: { structure?:'DURABLE'|'SEMI_DURABLE'|'TEMPORARY'; condition?:'GOOD'|'FAIR'|'POOR'; basicUtilities?:boolean };
};
export type PortfolioFacts = { transactionHistory?:{dueInstallments:number;missedInstallments:number;overdueAmount:string;principalAmount:string}; savings?:{balance:string;monthlyInstallment:string}; summary?:{scheduleMissCount:number;partialPaymentCount:number}; source?:unknown };
const clamp=(n:bigint)=>n<0n?0n:n>10000n?10000n:n;
const round=(n:bigint,d:bigint)=>(n+d/2n)/d;
function money(v:unknown):bigint|null { if(typeof v!=='string'||!/^\d{1,12}(\.\d{1,2})?$/.test(v))return null;const [whole,fraction='']=v.split('.');return BigInt(whole!)*100n+BigInt(fraction.padEnd(2,'0')); }
function decimal(n:bigint,places=2){const scale=10n**BigInt(places);return `${n/scale}.${String(n%scale).padStart(places,'0')}`;}
export function calculateClientScore(input:AssessmentInput,facts:PortfolioFacts={}) {
  const scores:Record<Category,bigint|null>={incomeSource:null,socialAcceptance:null,transactionHistory:null,savings:null,houseInfrastructure:null};
  const reasons:Record<Category,string>={incomeSource:'MISSING_INCOME_FACTS',socialAcceptance:'MISSING_SOCIAL_RATING',transactionHistory:'MISSING_PORTFOLIO_HISTORY',savings:'MISSING_SAVINGS_HISTORY',houseInfrastructure:'MISSING_HOUSE_FACTS'};
  const inc=input.incomeSource;
  if(inc){const income=money(inc.monthlyIncome),expense=money(inc.monthlyExpense),debt=money(inc.monthlyDebtPayment);const stability=inc.stability?{STABLE:10000n,SEASONAL:6000n,IRREGULAR:2000n}[inc.stability]:undefined;
    if(income!==null&&expense!==null&&debt!==null&&stability!==undefined){const margin=income>0n?clamp(round((income-expense-debt>0n?income-expense-debt:0n)*20000n,income)):0n;scores.incomeSource=income>0n?round(margin*80n+stability*20n,100n):0n;reasons.incomeSource='DEMO_SURPLUS_MARGIN_80_STABILITY_20';}}
  const rating=input.socialAcceptance?.rating;
  if(Number.isInteger(rating)&&rating!>=1&&rating!<=10){scores.socialAcceptance=round(BigInt(rating!-1)*10000n,9n);reasons.socialAcceptance='DEMO_RATING_1_TO_10_LINEAR';}
  const tx=facts.transactionHistory ?? (facts.summary ? {dueInstallments:Math.max(1,facts.summary.scheduleMissCount+facts.summary.partialPaymentCount),missedInstallments:Math.min(Math.max(0,facts.summary.scheduleMissCount),Math.max(1,facts.summary.scheduleMissCount+facts.summary.partialPaymentCount)),overdueAmount:'0.00',principalAmount:'1.00'} : undefined);
  if(tx&&Number.isSafeInteger(tx.dueInstallments)&&Number.isSafeInteger(tx.missedInstallments)&&tx.dueInstallments>0&&tx.missedInstallments>=0&&tx.missedInstallments<=tx.dueInstallments){const overdue=money(tx.overdueAmount),principal=money(tx.principalAmount);if(overdue!==null&&principal!==null&&principal>0n){const onTime=round(BigInt(tx.dueInstallments-tx.missedInstallments)*10000n,BigInt(tx.dueInstallments));const coverage=clamp(10000n-round(overdue*50000n,principal));scores.transactionHistory=round(onTime*70n+coverage*30n,100n);reasons.transactionHistory='DEMO_PAID_SCHEDULES_70_OVERDUE_COVERAGE_30';}}
  const savings=facts.savings;
  if(savings){const balance=money(savings.balance),installment=money(savings.monthlyInstallment);if(balance!==null&&installment!==null&&installment>0n){scores.savings=clamp(round(balance*10000n,installment*3n));reasons.savings='DEMO_THREE_INSTALLMENT_BUFFER';}}
  const house=input.houseInfrastructure;
  if(house?.structure&&house.condition&&typeof house.basicUtilities==='boolean'){const structure={DURABLE:10000n,SEMI_DURABLE:6000n,TEMPORARY:2000n}[house.structure],condition={GOOD:10000n,FAIR:6000n,POOR:2000n}[house.condition];if(structure!==undefined&&condition!==undefined){scores.houseInfrastructure=round(structure*50n+condition*40n+(house.basicUtilities?10000n:0n)*10n,100n);reasons.houseInfrastructure='DEMO_STRUCTURE_50_CONDITION_40_UTILITIES_10';}}
  const missing=(Object.keys(WEIGHTS) as Category[]).filter(key=>scores[key]===null);
  const sum=(Object.keys(WEIGHTS) as Category[]).reduce((total,key)=>total+(scores[key]??0n)*BigInt(WEIGHTS[key]),0n);
  const total=missing.length?null:round(sum,100n);
  return {ruleVersion:CLIENT_RULE_VERSION,demo:true,direction:'HIGHER_IS_BETTER' as const,notice:RECOMMENDATION_NOTICE,
    totalScore:total===null?null:decimal(total),classification:total===null?'INCOMPLETE':total>=8000n?'RISK_FREE_LOAN':total>=6000n?'REVIEW_REQUIRED':'HIGHER_RISK',
    missingCategories:missing,categories:(Object.keys(WEIGHTS) as Category[]).map(key=>({key,weightPercent:WEIGHTS[key],score:scores[key]===null?null:decimal(scores[key]!),weightedContribution:scores[key]===null?null:decimal(scores[key]!*BigInt(WEIGHTS[key]),4),reason:reasons[key]}))};
}
