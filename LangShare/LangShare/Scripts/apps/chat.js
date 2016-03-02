﻿/// <reference path="../knockout-3.4.0.debug.js" />
/// <reference path="../jquery-2.2.0.intellisense.js" />
/// <reference path="../jquery.signalR-2.2.0.js" />


(function () {

    function Message(from, msg, isPrivate) {
        this.from = ko.observable(from);
        this.message = ko.observable(msg);
        this.isPrivate = ko.observable(isPrivate);
    }

    function User(name) {

        var self = this;

        self.name = ko.observable(name);
        self.isPrivateChatUser = ko.observable(false);
        self.setAsPrivateChat = function (user) {
            viewModel.privateChatUser(user.name());
            viewModel.isInPrivateChat(true);
            $.each(viewModel.users(), function (i, user) {
                user.isPrivateChatUser(false);


            });
            self.isPrivateChatUser(true);
        };
    }

    var viewModel = {
        messages: ko.observableArray([]),
        users: ko.observableArray([]),
        isInPrivateChat: ko.observable(false),
        privateChatUser: ko.observable(),
        exitFromPrivateChat: function () {

            viewModel.isInPrivateChat(false);
            viewModel.privateChatUser(null);
            $.each(viewModel.users(), function (i, user) {
                user.isPrivateChatUser(false);


            });
        }
    };

    $(function () {

        var chatHub = $.connection.chatHub,
            loginHub = $.connection.login,
            $sendBtn = $('#btnSend'),
            $msgTxt = $('#txtMsg');
            

        // turn the logging on for demo purposes
        $.connection.hub.logging = true;

        chatHub.client.received = function (message) {
            viewModel.messages.push(new Message(message.sender, message.message, message.isPrivate));
        };

        chatHub.client.userConnected = function (username) {
            viewModel.users.push(new User(username));
        };

        chatHub.client.userDisconnected = function (username) {
            viewModel.users.pop(new User(username));
            if (viewModel.isInPrivateChat() && viewModel.privateChatUser() === username) {
                viewModel.isInPrivateChat(false);
                viewModel.privateChatUser(null);
            }

        };

        // $.connection.hub.starting(callback)
        // there is also $.connection.hub.(received|stateChanged|error|disconnected|connectionSlow|reconnected)

        // $($.connection.hub).bind($.signalR.events.onStart, callback)

        // $.connection.hub.error(function () {
        //     console.log("foo");
        // });

        startConnection();
        ko.applyBindings(viewModel);

        function startConnection() {

            $.connection.hub.start().done(function () {

                toggleInputs(false);
                bindClickEvents();

                $msgTxt.focus();

                chatHub.server.getConnectedUsers().done(function (users) {
                    $.each(users, function (i, username) {
                        viewModel.users.push(new User(username));



                        // AUTO SCROLL FOR USERS
                        var div = document.getElementById("userlist");
                        // increase the scroll position by 10 px every 10th of a second
                        setInterval(function () {
                            // make sure it's not at the bottom
                            if (div.scrollTop < div.scrollHeight - div.clientHeight)
                                div.scrollTop += 10; // move down
                        }, 100); // 100 milliseconds
                    });
                });

            }).fail(function (err) {

                console.log(err);
            });
        }

        function bindClickEvents() {
            $msgTxt.keypress(function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code === 13) {
                    sendMessage();
           
                    $("#scroller").append;
                    $('#scroller').animate({ scrollTop: $('#scroller').prop("scrollHeight") }, 300);

 // INPUT MESSAGE JS

                }
            });

            $sendBtn.click(function (e) {

                sendMessage();
                e.preventDefault();
                $("#scroller").append;
                $('#scroller').animate({ scrollTop: $('#scroller').prop("scrollHeight") }, 300);
            });
        }

        function sendMessage() {

            var msgValue = $msgTxt.val();
            if (msgValue !== null && msgValue.length > 0) {

                if (viewModel.isInPrivateChat()) {

                    chatHub.server.send(msgValue, viewModel.privateChatUser()).fail(function (err) {
                        console.log('Send method failed: ' + err);
                    });
                }
                else {
                    chatHub.server.send(msgValue).fail(function (err) {
                        console.log('Send method failed: ' + err);
                    });
                }
            }

            $msgTxt.val(null);
            $msgTxt.focus();
        }

        function toggleInputs(status) {

            $sendBtn.prop('disabled', status);
            $msgTxt.prop('disabled', status);
        }

    });
}());