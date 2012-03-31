var pageHandler = new PageHandler();
var dataAccess = new DataAccess();

// INIT: After loading document
$(document).ready(function() {
    pageHandler.init();
});


function DataAccess() {
    //save reference (for next generations)
    var that = this;


    // TODO: Load info from localStorage - if not available return false
    this.loadLocal = function() {
        localStorage.get();
        return false;
    }


    this.displayLogin = function(user) {
        var login = document.getElementById("login");
        console.log(JSON.stringify(user));
        if (user && user.email) {
            login.innerHTML = '<span>' + user.email + ' </span><a id="login-logout" href="#login">(logout)</a>';
        } else {
            login.innerHTML = '<a id="login-login" href="#login">login</a>';
        }
    }

    this.loadUser = function() {
        var $jqXHR = $.getJSON("/auth/user", function(user) {
            dataAccess.displayLogin(user);
        });
        $jqXHR.error(function(e) {
            dataAccess.displayLogin();
        });
    }

}



///////////////////////////////
// Handler of page operations
///////////////////////////////
function PageHandler() {
    //save reference (for next generations)
    var that = this;

    // initialize page control
    this.init = function() {
        this.initHandlers();
        dataAccess.loadUser();
    };

    // initialize handlers and event listeners
    this.initHandlers = function() {
        // filter items in lists

        // login/registration button // TODO: odprasit... moc selektorů
        $('#login').on("click", "a", function() {
            if (this.id === "login-logout") {
                $.get("/logout", function() {
                    dataAccess.displayLogin(null);
                });
            } else {
                $("#login-button").show();
                $('div#login-form-overlay').toggle('fast');
            }
        });

        $('#login > a#login-register,  a#form-close-btn').click(function() {
            $(".register-field").show();
            $("#login-button").hide();
            $('div#login-form-overlay').toggle('fast');
        })
    };
}



