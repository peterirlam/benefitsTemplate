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
  let nameFile = DriveApp.getFileById(fileId);
  let theName = nameFile.getName();
  let htmlTemplate = "<!DOCTYPE html><html><head><base target='_blank'></head><body>";
  if (eventtype == "copy") {
    // Create a copy of the template
    let timeZone = Session.getScriptTimeZone();
    let formattedDate = Utilities.formatDate(new Date(), timeZone, "dd/MM/YYYY HH:mm:ss");
    let newUrl = nameFile.makeCopy(theName + "_" + formattedDate, newFolder).getUrl();
    let doc = DocumentApp.openByUrl(newUrl);
    htmlTemplate += "<p><a id='open_doc' style='font-size:20px;font-family:Verdana;' href='" + newUrl + "'>" + theName + "_" + formattedDate + "</a></p><br/><br/>";
  }
  if (eventtype == "prevcopy") {
    // Get list of previous templates
    let fileIds = list_template_copies(newFolder.getId());

    htmlTemplate += "<script>function callback(templatecopyid) {document.getElementById(templatecopyid).innerHTML ='';document.getElementById('msgdelete').style.display='none';};</script>";
    htmlTemplate += "<script>function deletetemplate(deletefileId,templatecopyid,msgdeleteid) {document.getElementById(msgdeleteid).style.display='inline';google.script.run.withSuccessHandler(callback).deleteFile(deletefileId,templatecopyid);};</script>"

    if (fileIds.length == 0) {
      htmlTemplate += "<p style='font-family:arial, helvetica, sans-serif;margin:top:180px;text-align:center;font-size:18px; font-weight:normal;'>- No Templates Currently Saved -</p>";
    } else {
      for (var i = 0; i < fileIds.length; i++) {
        htmlTemplate += "<p id='templatecopyid" + i + "'><a style='font-size:18px;font-family:Verdana;font-weight:normal;' href='" + DriveApp.getFileById(fileIds[i]).getUrl() + "'>" + DriveApp.getFileById(fileIds[i]).getName() + "</a>";
        htmlTemplate += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        htmlTemplate += "<button style='display:inline;'class='link' id='btnDelete' onclick='deletetemplate(\"" + DriveApp.getFileById(fileIds[i]).getId() + "\",\"templatecopyid" + i + "\",\"msgdeleteid" + i + "\");'>Delete</button>";
        htmlTemplate += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id='msgdeleteid" + i + "' style='display:none;color:red;font-weight:bold;font-size:18px;font-family:vernanda;'>...Deleting</span></p>";
      }
    }
  }
  htmlTemplate += "</body></html>";
  let html = HtmlService.createTemplate(htmlTemplate);
  return html;
}

function list_template_copies(folderID) {
  let folder = DriveApp.getFolderById(folderID); // Change the folder ID  here
  let list = [];
  let files = folder.getFiles();
  while (files.hasNext()) {
    file = files.next();
    list.push(file.getId());
  }
  return list;
}