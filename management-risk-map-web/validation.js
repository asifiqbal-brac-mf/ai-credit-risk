export function validateFeature(f){const p=f?.properties??{};return Number(p.applicationCount)<5?{...p,riskLevel:'INSUFFICIENT_DATA',averageAreaScore:null,highRiskCount:null}:p;}
