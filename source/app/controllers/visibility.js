$( document ).ready(function() {
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});
 
 //DASHBOARD BG
 $('#pills-dashboard-tab').on('click', function () {
    $("html").removeClass("no-bg");
    $("html").removeClass("profile-bg");
    $("html").removeClass("stats-bg");
     $("html").removeClass("items-bg");
    $('html').addClass('dashboard-bg');
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});

//NO BG
$('#pills-items-tab').on('click', function () {
     $("html").removeClass("no-bg");
    $("html").removeClass("dashboard-bg");
    $("html").removeClass("profile-bg");
    $("html").removeClass("stats-bg");
    $('html').addClass('items-bg');
    $('BlueTeamShadow').show();
    $('OrangeTeamShadow').show();
});

//NO BG
$('#pills-textures-tab').on('click', function () {
    $("html").removeClass("dashboard-bg");
    $("html").removeClass("stats-bg");
    $("html").removeClass("items-bg");
    $("html").removeClass("profile-bg");
    $('html').addClass('no-bg');
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});

//NO BG
$('#pills-extras-tab').on('click', function () {
    $("html").removeClass("dashboard-bg");
    $("html").removeClass("profile-bg");
    $("html").removeClass("items-bg");
    $("html").removeClass("stats-bg");
    $('html').addClass('no-bg');
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});

//NO BG
$('#pills-stats-tab').on('click', function () {
    $("html").removeClass("dashboard-bg");
    $("html").removeClass("profile-bg");
    $("html").removeClass("items-bg");
    $("html").removeClass("stats-bg");
    $('html').addClass('no-bg');
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});

//NO BG
$('#pills-banner-tab').on('click', function () {
    $("html").removeClass("dashboard-bg");
    $("html").removeClass("profile-bg");
    $("html").removeClass("items-bg");
    $("html").removeClass("stats-bg");
    $('html').addClass('no-bg');
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});

//NO BG
$('#pills-title-tab').on('click', function () {
    $("html").removeClass("dashboard-bg");
    $("html").removeClass("profile-bg");
    $("html").removeClass("items-bg");
    $("html").removeClass("stats-bg");
    $('html').addClass('no-bg');
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});

//NO BG
$('#pills-profile-tab').on('click', function () {
    $("html").removeClass("dashboard-bg");
    $("html").removeClass("stats-bg");
    $("html").addClass("profile-bg");
    $("html").removeClass("items-bg");
    $('html').removeClass('no-bg');
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});

//NO BG
$('#pills-options-tab').on('click', function () {
    $("html").removeClass("dashboard-bg");
    $("html").removeClass("profile-bg");
    $("html").removeClass("items-bg");
    $("html").removeClass("stats-bg");
    $('html').addClass('no-bg');
    $('BlueTeamShadow').hide();
    $('OrangeTeamShadow').hide();
});