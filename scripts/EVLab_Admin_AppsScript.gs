/**
 * EVLab Administrator Authentication & Management Google Apps Script API
 * Dedicated to Google Sheet: "EVLab_Admin"
 * 
 * Required Sheets inside EVLab_Admin:
 * 1. Admins (admin_id, name, email, password_hash, role, status, created_at, last_login, failed_attempts, locked_until)
 * 2. Sessions (session_id, admin_id, created_at, expires_at, ip_or_context)
 * 3. Audit_Log (timestamp, admin_id, action, module, object_id, details, ip_or_context)
 * 4. Settings (setting, value, description)
 */

// Deployment Handler for POST requests
function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action || 'login';
    
    // Auto-setup sheets and headers if required
    setupInitialSheetsIfMissing();

    switch (action) {
      case 'login':
        return responseJSON(handleLogin(contents));
      case 'verifySession':
        return responseJSON(handleVerifySession(contents));
      case 'logout':
        return responseJSON(handleLogout(contents));
      case 'changePassword':
        return responseJSON(handleChangePassword(contents));
      case 'getAdmins':
        return responseJSON(handleGetAdmins(contents));
      case 'createAdmin':
        return responseJSON(handleCreateAdmin(contents));
      case 'updateAdmin':
        return responseJSON(handleUpdateAdmin(contents));
      case 'resetPassword':
        return responseJSON(handleResetPassword(contents));
      case 'getAuditLogs':
        return responseJSON(handleGetAuditLogs(contents));
      default:
        return responseJSON({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return responseJSON({ success: false, error: 'Server Error: ' + err.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 1. Setup Initial Spreadsheet Structure
 */
function setupInitialSheetsIfMissing() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet: Admins
  var adminsSheet = ss.getSheetByName("Admins");
  if (!adminsSheet) {
    adminsSheet = ss.insertSheet("Admins");
    adminsSheet.appendRow([
      "admin_id", "name", "email", "password_hash", "role", "status", "created_at", "last_login", "failed_attempts", "locked_until"
    ]);
  }
  
  // Create Initial Admin Account if empty
  if (adminsSheet.getLastRow() <= 1) {
    var defaultAdminId = "EVL-ADMIN-001";
    var defaultEmail = "engineering.visual.lab@gmail.com";
    var defaultName = "EVLab Administrator";
    var defaultRole = "super_admin";
    var defaultStatus = "active";
    var defaultPasswordHash = hashPassword("EVLab@2026!Admin"); // Default initial password
    var createdAt = new Date().toISOString();
    
    adminsSheet.appendRow([
      defaultAdminId, defaultName, defaultEmail, defaultPasswordHash, defaultRole, defaultStatus, createdAt, "", 0, ""
    ]);
  }

  // Sheet: Sessions
  var sessionsSheet = ss.getSheetByName("Sessions");
  if (!sessionsSheet) {
    sessionsSheet = ss.insertSheet("Sessions");
    sessionsSheet.appendRow(["session_id", "admin_id", "created_at", "expires_at", "ip_or_context"]);
  }

  // Sheet: Audit_Log
  var auditSheet = ss.getSheetByName("Audit_Log");
  if (!auditSheet) {
    auditSheet = ss.insertSheet("Audit_Log");
    auditSheet.appendRow(["timestamp", "admin_id", "action", "module", "object_id", "details", "ip_or_context"]);
  }

  // Sheet: Settings
  var settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["setting", "value", "description"]);
    settingsSheet.appendRow(["max_failed_attempts", "5", "Maximum failed login attempts allowed before lockout"]);
    settingsSheet.appendRow(["lockout_minutes", "15", "Lockout duration in minutes"]);
    settingsSheet.appendRow(["session_hours", "8", "Session duration in hours"]);
  }
}

/**
 * Password Hashing Helper
 */
function hashPassword(password) {
  var salt = "EVLab_Digital_Twin_2026_Secure_Salt#";
  var rawBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + password, Utilities.Charset.UTF_8);
  var hexString = "";
  for (var i = 0; i < rawBytes.length; i++) {
    var byteVal = rawBytes[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = "0" + byteHex;
    hexString += byteHex;
  }
  return hexString;
}

/**
 * 2. Handle Admin Login
 */
function handleLogin(contents) {
  var adminId = (contents.admin_id || '').trim();
  var password = contents.password || '';

  if (!adminId || !password) {
    return { success: false, error: "Admin ID and Password are required." };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var adminsSheet = ss.getSheetByName("Admins");
  var data = adminsSheet.getDataRange().getValues();

  var rowIndex = -1;
  var adminRecord = null;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === adminId.toUpperCase()) {
      rowIndex = i + 1; // 1-based sheet row
      adminRecord = {
        admin_id: data[i][0],
        name: data[i][1],
        email: data[i][2],
        password_hash: data[i][3],
        role: data[i][4],
        status: data[i][5],
        created_at: data[i][6],
        last_login: data[i][7],
        failed_attempts: parseInt(data[i][8] || 0),
        locked_until: data[i][9]
      };
      break;
    }
  }

  if (!adminRecord) {
    logAuditEntry("EVL-SYSTEM", "Login Failed", "Auth", adminId, "Admin ID not found");
    return { success: false, error: "Invalid Admin ID or Password." };
  }

  var now = new Date();

  // Check lockout status
  if (adminRecord.status === 'inactive') {
    return { success: false, error: "This administrator account is deactivated. Contact Super Admin." };
  }

  if (adminRecord.locked_until) {
    var lockTime = new Date(adminRecord.locked_until);
    if (now < lockTime) {
      var remainingMins = Math.ceil((lockTime - now) / 60000);
      return { 
        success: false, 
        error: "Account locked due to 5 consecutive failed attempts. Try again in " + remainingMins + " minute(s)." 
      };
    } else {
      // Lock expired, unlock account
      adminRecord.status = 'active';
      adminRecord.locked_until = "";
      adminRecord.failed_attempts = 0;
      adminsSheet.getRange(rowIndex, 6).setValue("active");
      adminsSheet.getRange(rowIndex, 9).setValue(0);
      adminsSheet.getRange(rowIndex, 10).setValue("");
    }
  }

  // Verify Password Hash
  var inputHash = hashPassword(password);
  if (inputHash !== adminRecord.password_hash) {
    var newFailed = adminRecord.failed_attempts + 1;
    var maxFailed = 5;
    
    if (newFailed >= maxFailed) {
      var lockoutUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
      adminsSheet.getRange(rowIndex, 6).setValue("locked");
      adminsSheet.getRange(rowIndex, 9).setValue(newFailed);
      adminsSheet.getRange(rowIndex, 10).setValue(lockoutUntil);

      logAuditEntry(adminRecord.admin_id, "Account Locked", "Auth", adminRecord.admin_id, "5 failed login attempts exceeded. Temporary 15 min lock applied.");
      return { 
        success: false, 
        error: "Maximum 5 failed attempts exceeded. Account locked temporarily for 15 minutes." 
      };
    } else {
      adminsSheet.getRange(rowIndex, 9).setValue(newFailed);
      logAuditEntry(adminRecord.admin_id, "Login Failed", "Auth", adminRecord.admin_id, "Incorrect password. Failed attempt " + newFailed + "/5");
      return { 
        success: false, 
        error: "Invalid Admin ID or Password. (" + (maxFailed - newFailed) + " attempt(s) remaining)" 
      };
    }
  }

  // Successful Login
  var sessionId = "sess_" + Utilities.getUuid();
  var sessionHours = 8;
  var sessionExpires = new Date(now.getTime() + sessionHours * 60 * 60 * 1000).toISOString();

  // Reset failed attempts & record last_login
  adminsSheet.getRange(rowIndex, 6).setValue("active");
  adminsSheet.getRange(rowIndex, 8).setValue(now.toISOString());
  adminsSheet.getRange(rowIndex, 9).setValue(0);
  adminsSheet.getRange(rowIndex, 10).setValue("");

  // Record Session
  var sessionsSheet = ss.getSheetByName("Sessions");
  sessionsSheet.appendRow([sessionId, adminRecord.admin_id, now.toISOString(), sessionExpires, contents.ip_or_context || "Web Client"]);

  logAuditEntry(adminRecord.admin_id, "Login Successful", "Auth", adminRecord.admin_id, "Admin session initiated via Google Sheets Auth");

  return {
    success: true,
    authenticated: true,
    session: {
      token: sessionId,
      admin_id: adminRecord.admin_id,
      name: adminRecord.name,
      email: adminRecord.email,
      role: adminRecord.role,
      createdAt: now.toISOString(),
      expiresAt: sessionExpires
    }
  };
}

/**
 * 3. Verify Session
 */
function handleVerifySession(contents) {
  var token = contents.token;
  if (!token) return { success: false, valid: false };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sessionsSheet = ss.getSheetByName("Sessions");
  var data = sessionsSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === token) {
      var expiresAt = new Date(data[i][3]);
      if (new Date() > expiresAt) {
        return { success: false, valid: false, error: "Session expired" };
      }
      return { success: true, valid: true, admin_id: data[i][1] };
    }
  }
  return { success: false, valid: false };
}

/**
 * 4. Logout Session
 */
function handleLogout(contents) {
  var token = contents.token;
  if (token) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sessionsSheet = ss.getSheetByName("Sessions");
    var data = sessionsSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === token) {
        sessionsSheet.deleteRow(i + 1);
        break;
      }
    }
  }
  return { success: true };
}

/**
 * 5. Change Password
 */
function handleChangePassword(contents) {
  var adminId = contents.admin_id;
  var currentPassword = contents.current_password;
  var newPassword = contents.new_password;

  if (!adminId || !currentPassword || !newPassword) {
    return { success: false, error: "Missing required fields for password change." };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var adminsSheet = ss.getSheetByName("Admins");
  var data = adminsSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === adminId.toUpperCase()) {
      var storedHash = data[i][3];
      if (hashPassword(currentPassword) !== storedHash) {
        return { success: false, error: "Current password is incorrect." };
      }

      var newHash = hashPassword(newPassword);
      adminsSheet.getRange(i + 1, 4).setValue(newHash);
      logAuditEntry(adminId, "Password Changed", "Account", adminId, "Administrator password updated successfully");
      return { success: true, message: "Password updated successfully." };
    }
  }

  return { success: false, error: "Admin account not found." };
}

/**
 * 6. Admin Account Management (getAdmins, createAdmin, updateAdmin, resetPassword)
 */
function handleGetAdmins(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var adminsSheet = ss.getSheetByName("Admins");
  var data = adminsSheet.getDataRange().getValues();
  var list = [];

  for (var i = 1; i < data.length; i++) {
    list.push({
      admin_id: data[i][0],
      name: data[i][1],
      email: data[i][2],
      role: data[i][4],
      status: data[i][5],
      created_at: data[i][6],
      last_login: data[i][7],
      failed_attempts: data[i][8],
      locked_until: data[i][9]
    });
  }

  return { success: true, admins: list };
}

function handleCreateAdmin(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var adminsSheet = ss.getSheetByName("Admins");
  var adminId = (contents.admin_id || '').trim();
  var name = (contents.name || '').trim();
  var email = (contents.email || '').trim();
  var password = contents.password;
  var role = contents.role || 'admin';

  if (!adminId || !name || !email || !password) {
    return { success: false, error: "Admin ID, Name, Email, and Initial Password are required." };
  }

  var data = adminsSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === adminId.toUpperCase()) {
      return { success: false, error: "Admin ID already exists. Choose a unique Admin ID." };
    }
  }

  var passHash = hashPassword(password);
  var createdAt = new Date().toISOString();

  adminsSheet.appendRow([adminId, name, email, passHash, role, 'active', createdAt, '', 0, '']);
  logAuditEntry(contents.created_by || 'SUPER_ADMIN', 'Created Admin Account', 'UserManagement', adminId, 'New administrator account created: ' + name);

  return { success: true, message: "Admin account created successfully." };
}

function handleUpdateAdmin(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var adminsSheet = ss.getSheetByName("Admins");
  var adminId = contents.admin_id;
  var data = adminsSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === String(adminId).toUpperCase()) {
      if (contents.name) adminsSheet.getRange(i + 1, 2).setValue(contents.name);
      if (contents.email) adminsSheet.getRange(i + 1, 3).setValue(contents.email);
      if (contents.role) adminsSheet.getRange(i + 1, 5).setValue(contents.role);
      if (contents.status) {
        adminsSheet.getRange(i + 1, 6).setValue(contents.status);
        if (contents.status === 'active') {
          adminsSheet.getRange(i + 1, 9).setValue(0);
          adminsSheet.getRange(i + 1, 10).setValue("");
        }
      }
      logAuditEntry(contents.updated_by || 'SUPER_ADMIN', 'Updated Admin Details', 'UserManagement', adminId, 'Updated details for admin ' + adminId);
      return { success: true, message: "Admin details updated successfully." };
    }
  }
  return { success: false, error: "Admin ID not found." };
}

function handleResetPassword(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var adminsSheet = ss.getSheetByName("Admins");
  var adminId = contents.admin_id;
  var newPassword = contents.new_password;

  if (!adminId || !newPassword) {
    return { success: false, error: "Admin ID and New Password are required." };
  }

  var data = adminsSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === String(adminId).toUpperCase()) {
      var passHash = hashPassword(newPassword);
      adminsSheet.getRange(i + 1, 4).setValue(passHash);
      adminsSheet.getRange(i + 1, 6).setValue('active');
      adminsSheet.getRange(i + 1, 9).setValue(0);
      adminsSheet.getRange(i + 1, 10).setValue('');
      logAuditEntry(contents.reset_by || 'SUPER_ADMIN', 'Reset Admin Password', 'UserManagement', adminId, 'Password reset by administrator');
      return { success: true, message: "Password reset successfully." };
    }
  }
  return { success: false, error: "Admin ID not found." };
}

/**
 * 7. Audit Logging Helper
 */
function handleGetAuditLogs(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var auditSheet = ss.getSheetByName("Audit_Log");
  var data = auditSheet.getDataRange().getValues();
  var logs = [];

  for (var i = Math.max(1, data.length - 100); i < data.length; i++) {
    logs.unshift({
      timestamp: data[i][0],
      admin_id: data[i][1],
      action: data[i][2],
      module: data[i][3],
      object_id: data[i][4],
      details: data[i][5],
      ip_or_context: data[i][6]
    });
  }

  return { success: true, auditLogs: logs };
}

function logAuditEntry(adminId, action, module, objectId, details) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var auditSheet = ss.getSheetByName("Audit_Log");
    if (!auditSheet) {
      setupInitialSheetsIfMissing();
      auditSheet = ss.getSheetByName("Audit_Log");
    }
    auditSheet.appendRow([
      new Date().toISOString(),
      adminId || 'SYSTEM',
      action || 'ACTION',
      module || 'System',
      objectId || '-',
      details || '',
      'EVLab AppsScript API'
    ]);
  } catch (err) {
    Logger.log("Audit log error: " + err.toString());
  }
}
