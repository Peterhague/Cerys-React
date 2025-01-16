import { FSCategoryBS } from "../interfaces/interfaces";

export const TOTAL_QUASI_CAT: FSCategoryBS = {
  statementName: "",
  statementNameTwo: null,
  categoryName: "",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: true,
  spaceBefore: true,
  spaceAfter: false,
  mappable: false,
};

export const SUBTOTAL_QUASI_CAT: FSCategoryBS = {
  statementName: "",
  statementNameTwo: null,
  categoryName: "",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: true,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: false,
};

export const FIXED_ASS_CAT: FSCategoryBS = {
  statementName: "Fixed assets",
  statementNameTwo: null,
  categoryName: "Fixed assets",
  sum: true,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: true,
  mappable: false,
};

export const IFA_CAT: FSCategoryBS = {
  statementName: "Intangible assets",
  statementNameTwo: null,
  categoryName: "Intangible assets",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const TFA_CAT: FSCategoryBS = {
  statementName: "Tangible assets",
  statementNameTwo: null,
  categoryName: "Tangible assets",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const FAI_CAT: FSCategoryBS = {
  statementName: "Fixed asset investments",
  statementNameTwo: null,
  categoryName: "Fixed asset investments",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const IP_CAT: FSCategoryBS = {
  statementName: "Investment property",
  statementNameTwo: null,
  categoryName: "Investment property",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const CURR_ASS_CAT: FSCategoryBS = {
  statementName: "Current assets",
  statementNameTwo: null,
  categoryName: "Current assets",
  sum: true,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: true,
  mappable: false,
};

export const STOCKS_CAT: FSCategoryBS = {
  statementName: "Stocks",
  statementNameTwo: null,
  categoryName: "Stocks",
  sum: false,
  total: false,
  subTotalCol: true,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const DEBTORS_CAT: FSCategoryBS = {
  statementName: "Debtors",
  statementNameTwo: null,
  categoryName: "Debtors",
  sum: false,
  total: false,
  subTotalCol: true,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const FIN_ASS_CAT: FSCategoryBS = {
  statementName: "Financial assets",
  statementNameTwo: null,
  categoryName: "Financial assets",
  sum: false,
  total: false,
  subTotalCol: true,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const CASH_CAT: FSCategoryBS = {
  statementName: "Cash at bank and in hand",
  statementNameTwo: null,
  categoryName: "Cash",
  sum: false,
  total: false,
  subTotalCol: true,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const CURR_LIA_CAT: FSCategoryBS = {
  statementName: "Current liabilities",
  statementNameTwo: null,
  categoryName: "Current liabilties",
  sum: true,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: true,
  mappable: false,
};

export const ST_CRED_CAT: FSCategoryBS = {
  statementName: "Creditors due in < 1 year",
  statementNameTwo: null,
  categoryName: "Creditors < 1 year",
  sum: false,
  total: false,
  subTotalCol: true,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const NCA_CAT: FSCategoryBS = {
  statementName: "Net current assets",
  statementNameTwo: null,
  categoryName: "Net current assets",
  sum: true,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: true,
  spaceAfter: false,
  mappable: false,
};

export const TALCL_CAT: FSCategoryBS = {
  statementName: "Total assets less current liabilities",
  statementNameTwo: null,
  categoryName: "Total assets less current liabilities",
  sum: true,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: true,
  spaceAfter: false,
  mappable: false,
};

export const LT_CRED_CAT: FSCategoryBS = {
  statementName: "Creditors due in > 1 year",
  statementNameTwo: null,
  categoryName: "Creditors > 1 year",
  sum: true,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: true,
  spaceAfter: false,
  mappable: true,
};

export const PROVS_CAT: FSCategoryBS = {
  statementName: "Provisions for liabilities",
  statementNameTwo: null,
  categoryName: "Provisions for liabilities",
  sum: true,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: true,
  spaceAfter: false,
  mappable: true,
};

export const NA_CAT: FSCategoryBS = {
  statementName: "Net assets",
  statementNameTwo: null,
  categoryName: "Net assets",
  sum: true,
  total: true,
  subTotalCol: false,
  subTotal: false,
  calculated: true,
  spaceBefore: true,
  spaceAfter: true,
  mappable: false,
};

export const CAP_RES_CAT: FSCategoryBS = {
  statementName: "Capital and reserves",
  statementNameTwo: null,
  categoryName: "Capital and reserves",
  sum: true,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: true,
  spaceAfter: true,
  mappable: false,
};

export const SHARE_CAP_CAT: FSCategoryBS = {
  statementName: "Share capital",
  statementNameTwo: null,
  categoryName: "Share capital",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const SHARE_PREM_CAT: FSCategoryBS = {
  statementName: "Share premium",
  statementNameTwo: null,
  categoryName: "Share premium",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const CAP_RED_RES_CAT: FSCategoryBS = {
  statementName: "Capital redemption reserve",
  statementNameTwo: null,
  categoryName: "Capital redemption reserve",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const FV_RES_CAT: FSCategoryBS = {
  statementName: "Fair value reserve",
  statementNameTwo: null,
  categoryName: "Fair value reserve",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const OR1_CAT: FSCategoryBS = {
  statementName: "Other reserves",
  statementNameTwo: null,
  categoryName: "Other reserves 1",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const OR2_CAT: FSCategoryBS = {
  statementName: "Other reserves 2",
  statementNameTwo: null,
  categoryName: "Other reserves 2",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const OR3_CAT: FSCategoryBS = {
  statementName: "Other reserves 3",
  statementNameTwo: null,
  categoryName: "Other reserves 3",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const OR4_CAT: FSCategoryBS = {
  statementName: "Other reserves 4",
  statementNameTwo: null,
  categoryName: "Other reserves 4",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const OR5_CAT: FSCategoryBS = {
  statementName: "Other reserves 5",
  statementNameTwo: null,
  categoryName: "Other reserves 5",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const MI_CAT: FSCategoryBS = {
  statementName: "Minority interest",
  statementNameTwo: null,
  categoryName: "Minority interest",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const PL_RES_CAT: FSCategoryBS = {
  statementName: "Profit & loss reserve",
  statementNameTwo: null,
  categoryName: "Profit & loss reserve",
  sum: false,
  total: false,
  subTotalCol: false,
  subTotal: false,
  calculated: false,
  spaceBefore: false,
  spaceAfter: false,
  mappable: true,
};

export const EQUITY_CAT: FSCategoryBS = {
  statementName: "Total equity",
  statementNameTwo: null,
  categoryName: "Total equity",
  sum: true,
  total: true,
  subTotalCol: false,
  subTotal: false,
  calculated: true,
  spaceBefore: true,
  spaceAfter: false,
  mappable: false,
};
