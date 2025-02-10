import { BaseCerysCodeObjectProps, ClientCerysCodeObjectProps, ClientMapping } from "../interfaces/interfaces";

export class BaseCerysCodeObject implements BaseCerysCodeObjectProps {
  cerysCode: number;
  cerysName: string;
  cerysShortName: string;
  cerysExcelName: string;
  cerysCategory: string;
  cerysSubCategory: string | null;
  isFixedAsset: boolean;
  assetCategory: string | null;
  assetCategoryNo: number | null;
  assetSubCategory: string | null;
  assetSubCatCode: number | null;
  assetCodeType: string | null;
  regColNameOne: string | null;
  regColNameTwo: string | null;
  altCategory: string | null;
  defaultSign: string | null;
  clientAdj: boolean;
  closeOffCode: number;
  cerysCodeObjectId: string;
  constructor(cerysCodeObj: BaseCerysCodeObjectProps) {
    this.cerysCode = cerysCodeObj.cerysCode;
    this.cerysName = cerysCodeObj.cerysName;
    this.cerysShortName = cerysCodeObj.cerysShortName;
    this.cerysExcelName = cerysCodeObj.cerysExcelName;
    this.cerysCategory = cerysCodeObj.cerysCategory;
    this.cerysSubCategory = cerysCodeObj.cerysSubCategory;
    this.isFixedAsset = cerysCodeObj.isFixedAsset;
    this.assetCategory = cerysCodeObj.assetCategory;
    this.assetCategoryNo = cerysCodeObj.assetCategoryNo;
    this.assetSubCategory = cerysCodeObj.assetSubCategory;
    this.assetSubCatCode = cerysCodeObj.assetSubCatCode;
    this.assetCodeType = cerysCodeObj.assetCodeType;
    this.regColNameOne = cerysCodeObj.regColNameOne;
    this.regColNameTwo = cerysCodeObj.regColNameTwo;
    this.altCategory = cerysCodeObj.altCategory;
    this.defaultSign = cerysCodeObj.defaultSign;
    this.clientAdj = cerysCodeObj.clientAdj;
    this.closeOffCode = cerysCodeObj.closeOffCode;
    this.cerysCodeObjectId = cerysCodeObj._id;
  }
}

export class ClientCerysCodeObject extends BaseCerysCodeObject implements ClientCerysCodeObjectProps {
  currentClientMapping: ClientMapping;
  previousClientMappings: ClientMapping[];
  _id?: string;
  constructor(codeObj: ClientCerysCodeObjectProps) {
    super(codeObj);
    this.currentClientMapping = codeObj.currentClientMapping;
    this.previousClientMappings = codeObj.previousClientMappings;
  }

  revertToDbIdNotation() {
    const reversion: ClientCerysCodeObject = { ...this, _id: this.cerysCodeObjectId };
    return reversion;
  }
}
