var url_host = window.location.origin;

$("#collapsibleNavbar").on('show.bs.collapse', function(){
    $("li.nav-item").addClass("border-top border-bottom border-white app-bg-1");
    $("nav.navbar").addClass("app-bg-1");
});

$("#collapsibleNavbar").on('hidden.bs.collapse', function(){
    $("li.nav-item").removeClass("border-top border-bottom border-white app-bg-1");
    $("nav.navbar").removeClass("app-bg-1");
});