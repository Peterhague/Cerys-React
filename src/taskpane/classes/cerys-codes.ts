import { ClientCerysCodeObjectProps, ClientMapping } from "../interfaces/interfaces";

export class ClientCerysCodeObject {
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
  currentClientMapping: ClientMapping;
  previousClientMappings: ClientMapping[];
  _id: string;
  constructor(codeObj: ClientCerysCodeObjectProps) {
    this.cerysCode = codeObj.cerysCode;
    this.cerysName = codeObj.cerysName;
    this.cerysShortName = codeObj.cerysShortName;
    this.cerysExcelName = codeObj.cerysExcelName;
    this.cerysCategory = codeObj.cerysCategory;
    this.cerysSubCategory = codeObj.cerysSubCategory;
    this.isFixedAsset = codeObj.isFixedAsset;
    this.assetCategory = codeObj.assetCategory;
    this.assetCategoryNo = codeObj.assetCategoryNo;
    this.assetSubCategory = codeObj.assetSubCategory;
    this.assetSubCatCode = codeObj.assetSubCatCode;
    this.assetCodeType = codeObj.assetCodeType;
    this.regColNameOne = codeObj.regColNameOne;
    this.regColNameTwo = codeObj.regColNameTwo;
    this.altCategory = codeObj.altCategory;
    this.defaultSign = codeObj.defaultSign;
    this.clientAdj = codeObj.clientAdj;
    this.closeOffCode = codeObj.closeOffCode;
    this.currentClientMapping = codeObj.currentClientMapping;
    this.previousClientMappings = codeObj.previousClientMappings;
    this._id = codeObj._id;
  }
}
