function deleteFile(deletefileId, templatecopyid) {
  DriveApp.getFileById(deletefileId).setTrashed(true);
  // return "<h1>" + fileId + "+++++++++++++++" + deletefileId + "</h1>";
  return templatecopyid;
}

function doGet(e) {
  try {
    let fileId = e.parameters.fileId;
    let eventtype = e.parameters.eventtype;
    let templateFolder = e.parameters.templateFolder;
    //var eventtype = "prevcopy";
    //var deletefileId = "1mxkmwS4EuLC229gOznG9NeQ_KgaZIgfCxggLeCx5Dbc"
    //var fileId = "1YQW5XhskeFVYSsB-PsIRHV_Jsbi56iwPezjA-paSA3Q";
    if (fileId) {
      let html = processTemplates(fileId, eventtype, templateFolder);
      return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } // End if fileID
  } catch (e) {
    console.log(e);
    Logger.log(e);
  }
}

function processTemplates(fileId, eventtype, templateFolder) {
  //var rootFolder=DriveApp.getFolderById(DriveApp.getRootFolder().getId());
  let rootFolder = DriveApp.getFolderById("0APAjIQqISl7iUk9PVA");
  let rootchildFolder, rootchildFolders;
  rootchildFolders = rootFolder.getFoldersByName("Template_Copies_" + Session.getActiveUser().getEmail());
  while (rootchildFolders.hasNext()) {
    rootchildFolder = rootchildFolders.next();
  }
  let newFolder;
  let newrootchildFolder;
  if (!rootchildFolder) {
    newrootchildFolder = rootFolder.createFolder("Template_Copies_" + Session.getActiveUser().getEmail());
    newFolder = newrootchildFolder.createFolder(templateFolder);
  } else {
    let childFolder, childFolders;
    childFolders = rootchildFolder.getFoldersByName(templateFolder);
    while (childFolders.hasNext()) {
      childFolder = childFolders.next();
    }
    if (!childFolder) {
      newFolder = rootchildFolder.createFolder(templateFolder);
    } else {
      newFolder = childFolder;
    }
  }