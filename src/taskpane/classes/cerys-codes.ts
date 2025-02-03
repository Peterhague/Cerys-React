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
  _id: string;
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
    this._id = cerysCodeObj._id;
  }
}

export class ClientCerysCodeObject extends BaseCerysCodeObject {
  currentClientMapping: ClientMapping;
  previousClientMappings: ClientMapping[];
  constructor(codeObj: ClientCerysCodeObjectProps) {
    super(codeObj);
    this.currentClientMapping = codeObj.currentClientMapping;
    this.previousClientMappings = codeObj.previousClientMappings;
  }
}
