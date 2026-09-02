export type AssetCategory =
  | "cash"
  | "stocks"
  | "funds"
  | "nisa"
  | "ideco"
  | "otherInvestment"
  | "realEstate";

export type PlanStatus = "current" | "scenario";

export interface FamilyMember {
  id: string;
  name: string;
  relationship: "self" | "partner" | "child" | "parent" | "other";
  birthDate: string;
  lifeExpectancy: number;
}

export interface AssetSnapshot {
  cash: number;
  stocks: number;
  funds: number;
  nisa: number;
  ideco: number;
  otherInvestment: number;
  realEstate: number;
  liabilities: number;
}

export interface Plan {
  id: string;
  name: string;
  status: PlanStatus;
  ownerId: string;
  family: FamilyMember[];
  initialAssets: AssetSnapshot;
}

export interface MonthlyCashFlow {
  year: number;
  month: number;
  income: number;
  expense: number;
}

export interface AnnualPlanSummary {
  year: number;
  income: number;
  expense: number;
  netCashFlow: number;
  cash: number;
  totalAssets: number;
  liabilities: number;
  netWorth: number;
}

export function totalAssets(snapshot: AssetSnapshot): number {
  return (
    snapshot.cash +
    snapshot.stocks +
    snapshot.funds +
    snapshot.nisa +
    snapshot.ideco +
    snapshot.otherInvestment +
    snapshot.realEstate
  );
}

export function aggregateAnnualCashFlow(
  monthly: MonthlyCashFlow[],
  initial: AssetSnapshot,
): AnnualPlanSummary[] {
  const byYear = new Map<number, { income: number; expense: number }>();

  for (const item of monthly) {
    const current = byYear.get(item.year) ?? { income: 0, expense: 0 };
    current.income += item.income;
    current.expense += item.expense;
    byYear.set(item.year, current);
  }

  let cash = initial.cash;
  const investmentAssets =
    initial.stocks +
    initial.funds +
    initial.nisa +
    initial.ideco +
    initial.otherInvestment +
    initial.realEstate;

  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, value]) => {
      const netCashFlow = value.income - value.expense;
      cash += netCashFlow;

      const total = cash + investmentAssets;
      return {
        year,
        income: value.income,
        expense: value.expense,
        netCashFlow,
        cash,
        totalAssets: total,
        liabilities: initial.liabilities,
        netWorth: total - initial.liabilities,
      };
    });
}
