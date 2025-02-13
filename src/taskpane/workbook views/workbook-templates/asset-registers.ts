import { Session } from "../../classes/session";
import { populateAssetRegWs } from "./asset-reg-population";
import { addDefaultWorksheet, deleteManyWorksheets } from "../../utils/worksheet";
import { applyWorkhseetHeader, worksheetHeader } from "../../workbook views/components/schedule-header";
/* global Excel */

export const createIFARegisterWorksheet = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      const transToPost = session.IFARegister;
      const activeCatsNames = [];
      const IFAActiveCats = [];
      session.IFARegister.assets.forEach((i) => {
        if (!activeCatsNames.includes(i.assetCategory)) {
          activeCatsNames.push(i.assetCategory);
          IFAActiveCats.push({
            assetCategory: i.assetCategory,
            assetCategoryNo: i.assetCategoryNo,
          });
        }
      });
      IFAActiveCats.sort((a, b) => {
        return a.assetCategoryNo - b.assetCategoryNo;
      });
      const wsName = "IFA Register";
      const ws = await addDefaultWorksheet(context, session, { name: wsName, addListeners: undefined });
      const wsHeaders = worksheetHeader(session, "Intangible fixed assets register");
      applyWorkhseetHeader(ws, wsHeaders);
      populateAssetRegWs(IFAActiveCats, transToPost, ws, "IFA");
      ws.activate();
      deleteManyWorksheets(["IFA Transactions"]);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const createTFARegisterWorksheet = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      const register = session.TFARegister;
      const activeCatsNames = [];
      const TFAActiveCats = [];
      register.assets.forEach((i) => {
        if (!activeCatsNames.includes(i.assetCategory)) {
          activeCatsNames.push(i.assetCategory);
          TFAActiveCats.push({
            assetCategory: i.assetCategory,
            assetCategoryNo: i.assetCategoryNo,
          });
        }
      });
      TFAActiveCats.sort((a, b) => {
        return a.assetCategoryNo - b.assetCategoryNo;
      });
      const wsName = "TFA Register";
      const ws = await addDefaultWorksheet(context, session, { name: wsName, addListeners: undefined });
      const wsHeaders = worksheetHeader(session, "Tangible fixed assets register");
      applyWorkhseetHeader(ws, wsHeaders);
      populateAssetRegWs(TFAActiveCats, register, ws, "TFA");
      ws.activate();
      deleteManyWorksheets(["TFA Transactions"]);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};

export const createIPRegisterWorksheet = async (session: Session) => {
  try {
    await Excel.run(async (context) => {
      const activeCatsNames = [];
      const IPActiveCats = [];
      const IPRegister = session.IPRegister;
      IPRegister.assets.forEach((i) => {
        if (!activeCatsNames.includes(i.assetCategory)) {
          activeCatsNames.push(i.assetCategory);
          IPActiveCats.push({
            assetCategory: i.assetCategory,
            assetCategoryNo: i.assetCategoryNo,
          });
        }
      });
      IPActiveCats.sort((a, b) => {
        return a.assetCategoryNo - b.assetCategoryNo;
      });
      const wsName = "IP Register";
      const ws = await addDefaultWorksheet(context, session, { name: wsName, addListeners: undefined });
      const wsHeaders = worksheetHeader(session, "Investment property register");
      applyWorkhseetHeader(ws, wsHeaders);
      populateAssetRegWs(IPActiveCats, IPRegister, ws, "IP");
      ws.activate();
      deleteManyWorksheets(["IP Transactions"]);
      await context.sync();
    });
  } catch (e) {
    console.error(e);
  }
};
