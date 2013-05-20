function display_login()
{
    if($('#login-button').html().indexOf('out') > 0) {
        $('#login-button').html('');
        $('#change-pswd-button').data("logged_in_user", "");
        $('#login-msg').html('Welcome guest');
    }
    var dlg = $('<div id="dialog-login" title="Login to DDerl" style="diaply:none">'
     +'  <table border=0 width=100% cellpadding=0 cellspacing=0>'
     +'      <tr><td align=right valign=center>User&nbsp;</td>'
     +'          <td valign=bottom><input type="text" id="user_login" class="text ui-widget-content ui-corner-all"/></td></tr>'
     +'      <tr><td align=right valign=center>Password&nbsp;</td>'
     +'          <td valign=bottom><input type="password" id="password_login" class="text ui-widget-content ui-corner-all"/></td></tr>'
     +'  </table>'
     +'</div>')
    .appendTo(document.body);

    dlg.dialog({
        autoOpen: false,
        minHeight: 100,
        height: 'auto',
        width: 'auto',
        resizable: false,
        modal: false,
        closeOnEscape: false,
        dialogClass: 'no-close',
        open: function(event, ui) {
            $('#user_login').val("admin");
            $('#password_login').focus();
            $(this).dialog("widget").appendTo("#main-body");
        },
        close: function() {
            $(this).dialog('destroy');
            $(this).remove();
        }
    })
    .dialog("open")
    .dialog("widget").draggable("option","containment","#main-body");

    $("#password_login").keypress(function(e) {
        if(e.which == 13) {
            var loginJson = {login: { user      :   $('#user_login').val(),
                                      password  :   MD5($('#password_login').val())}};
            ajaxCall(null,'/app/login',loginJson,'login', function(data) {
                if(data == "ok") {
                    var user = $('#user_login').val();
                    update_user_information(user);
                    $("#dialog-login").dialog("close");
                    connect_dlg();
                } else if (data == "expired") {
                    var user = $('#user_login').val();
                    update_user_information(user);
                    $("#dialog-login").dialog("close");
                    change_password(true);
                }
                else
                    alert('Login falied : ' + data);
            });        
        }
    });
}

function update_user_information(user) {
    var url = (window.location.protocol==='https:'?'wss://':'ws://')+window.location.host+'/ws';
    create_ws(url);
    $('#change-pswd-button').data("logged_in_user", user);
    $('#login-button').html('Log out ' + user);
}

function check_already_connected() {
    if(!window.opener || !window.opener.session ||
       !window.opener.$('#change-pswd-button').data("logged_in_user")) {
        display_login();
    } else {
        session = window.opener.session;
        var user = window.opener.$('#change-pswd-button').data("logged_in_user");
        update_user_information(user);
        connect_dlg();
    }
}

function logout() {
    if (!session) {
        return;
    }
    session = null;
    $('#login-button').html('');
    $('#change-pswd-button').data("logged_in_user", "");
    $('#login-msg').html('Welcome guest');
    if(window.opener) {
        window.opener.logout();
    }
    if(children) {
        for(var i=0; i < children.length; ++i){
            if(!children[i].closed) {
                children[i].logout();
            }
        }
    }
    display_login();
}

function change_password(shouldConnect)
{
    var loggedInUser = $('#change-pswd-button').data("logged_in_user");
    if(loggedInUser == undefined || loggedInUser.length == 0) {
        login_first();
        return;
    }

    $('<div id="dialog-change-password" title="Change DDerl account password">' +
      '  <table border=0 width=100% height=85% cellpadding=0 cellspacing=0>' +
      '      <tr><td align=right valign=center>User&nbsp;</td>' +
      '          <td valign=center><b>'+loggedInUser+'</b></td></tr>' +
      '      <tr><td align=right valign=center>Old Password&nbsp;</td>' +
      '          <td valign=bottom><input type="password" id="old_password_login" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '      <tr><td align=right valign=center>New Password&nbsp;</td>' +
      '          <td valign=bottom><input type="password" id="password_change_login" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '      <tr><td align=right valign=center>Confirm Password&nbsp;</td>' +
      '          <td valign=bottom><input type="password" id="conf_password_login" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '  </table>' +
      '</div>').appendTo(document.body);
    $('#dialog-change-password').dialog({
        autoOpen: false,
        height: 200,
        width: 300,
        resizable: false,
        modal: false,
        open: function() {
            $(this).dialog("widget").appendTo("#main-body");
        },
        close: function() {
            $("#dialog-change-password").dialog('destroy');
            $("#dialog-change-password").remove();
        },
        buttons: {
            "Change Password": function() {
                if($('#conf_password_login').val() == $('#password_change_login').val()) {
                    var newPassJson = {
                        change_pswd: {
                            user  :loggedInUser,
                            password  :MD5($('#old_password_login').val()),
                            new_password  :MD5($('#password_change_login').val())
                        }};
                    ajaxCall(null,'/app/login_change_pswd',newPassJson,'login_change_pswd', function(data) {
                        if(data == "ok") {
                            $("#dialog-change-password").dialog("close");
                            if(shouldConnect) {
                                connect_dlg();
                            }
                        }
                        else {
                            alert('Change password falied : ' + data);
                        }
                    });
                }
                else alert("Confirm password missmatch!");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }
    })
    .dialog("open")
    .dialog("widget").draggable("option","containment","#main-body");
}