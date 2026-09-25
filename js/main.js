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


    // ==========================================
    // EmailJS Contact Form Integration
    // ==========================================
    const EMAILJS_SERVICE_ID = "service_p8fum1r";
    const EMAILJS_TEMPLATE_ID = "template_w7tnyer";
    const EMAILJS_PUBLIC_KEY = "Xc7TTRij6ca27g7Pi";

    if (window.emailjs) {
        emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY
        });
    }

    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("form-status");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" || !EMAILJS_PUBLIC_KEY.trim()) {
                if (formStatus) {
                    formStatus.className = "alert alert-warning py-2 mb-3";
                    formStatus.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Please configure your EmailJS <strong>Public Key</strong> in <code>js/main.js</code>.';
                    formStatus.classList.remove("d-none");
                }
                return;
            }

            // UI Loading state
            if (submitBtn) submitBtn.disabled = true;
            if (btnSpinner) btnSpinner.classList.remove("d-none");
            if (btnText) btnText.textContent = "Sending...";
            if (formStatus) formStatus.classList.add("d-none");

            const nameVal = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
            const emailVal = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
            const subjectVal = document.getElementById("subject") ? document.getElementById("subject").value.trim() : "";
            const messageVal = document.getElementById("message") ? document.getElementById("message").value.trim() : "";

            // Format subject to prominently display the visitor's name in your inbox
            const fullSubject = nameVal ? `[${nameVal}] ${subjectVal}` : subjectVal;

            // Pass comprehensive template parameters to match whatever variable names the template uses
            const templateParams = {
                name: nameVal,
                from_name: nameVal,
                user_name: nameVal,
                email: emailVal,
                from_email: emailVal,
                user_email: emailVal,
                reply_to: emailVal,
                subject: fullSubject,
                user_subject: subjectVal,
                title: fullSubject,
                message: messageVal
            };

            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
                .then(function (response) {
                    console.log("Email sent successfully!", response.status, response.text);
                    if (formStatus) {
                        formStatus.className = "alert alert-success py-2 mb-3";
                        formStatus.innerHTML = '<i class="fas fa-check-circle me-2"></i>Thank you! Your message has been sent successfully.';
                        formStatus.classList.remove("d-none");
                    }
                    contactForm.reset();
                })
                .catch(function (error) {
                    console.error("Failed to send email:", error);
                    if (formStatus) {
                        formStatus.className = "alert alert-danger py-2 mb-3";
                        const errDetail = error && (error.text || error.message) ? (error.text || error.message) : "Failed to send message. Please try again.";
                        formStatus.innerHTML = '<i class="fas fa-times-circle me-2"></i>' + errDetail;
                        formStatus.classList.remove("d-none");
                    }
                })
                .finally(function () {
                    if (submitBtn) submitBtn.disabled = false;
                    if (btnSpinner) btnSpinner.classList.add("d-none");
                    if (btnText) btnText.textContent = "Send Message";
                });
        });
    }
    
})(jQuery);


