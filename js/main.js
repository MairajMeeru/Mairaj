(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Navbar on scrolling
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.navbar').fadeIn('slow').css('display', 'flex');
        } else {
            $('.navbar').fadeOut('slow').css('display', 'none');
        }
    });


    // Smooth scrolling on the navbar links
    $(".navbar-nav a").on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            
            $('html, body').animate({
                scrollTop: $(this.hash).offset().top - 45
            }, 1500, 'easeInOutExpo');
            
            if ($(this).parents('.navbar-nav').length) {
                $('.navbar-nav .active').removeClass('active');
                $(this).closest('a').addClass('active');
            }
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
    

    // Typed Initiate
    if ($('.typed-text-output').length == 1) {
        var typed_strings = $('.typed-text').text();
        var typed = new Typed('.typed-text-output', {
            strings: typed_strings.split(', '),
            typeSpeed: 100,
            backSpeed: 20,
            smartBackspace: false,
            loop: true
        });
    }


    // Modal Video
    var $videoSrc = '';
    $('.btn-play').click(function () {
        $videoSrc = $(this).data("src") || '';
    });

    $('#videoModal').on('shown.bs.modal', function (e) {
        if (!$videoSrc) return;
        var cleanSrc = String($videoSrc).replace(/\\/g, '/');
        var isLocalVideo = cleanSrc.match(/\.(mp4|webm|ogg)$/i) || !cleanSrc.match(/^https?:\/\//i);

        if (isLocalVideo) {
            $('#video').addClass('d-none').attr('src', '');
            var localVideo = document.getElementById('localVideo');
            if (localVideo) {
                $('#localVideo').removeClass('d-none');
                localVideo.src = cleanSrc;
                localVideo.load();
                localVideo.play().catch(function (err) {
                    console.log('Play prevented or waiting for interaction:', err);
                });
            }
        } else {
            $('#localVideo').addClass('d-none');
            var localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.pause();
                localVideo.src = '';
            }
            var embedUrl = cleanSrc + (cleanSrc.indexOf('?') === -1 ? '?autoplay=1' : '&autoplay=1');
            $('#video').removeClass('d-none').attr('src', embedUrl);
        }
    });

    $('#videoModal').on('hide.bs.modal', function (e) {
        // Completely stop playback and turn off all background video/audio
        var localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.pause();
            localVideo.currentTime = 0;
            localVideo.src = '';
            localVideo.load();
            $('#localVideo').addClass('d-none');
        }
        $("#video").attr('src', '').addClass('d-none');
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Skills
    $('.skill').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });
    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('active');
        $(this).addClass('active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
    });
    
})(jQuery);

