"use strict";

function ripple_bounce(element, event, size) {
    // Stop loop when ripple is removed
    if (element) {
        element.style.transition = "transform 1200ms cubic-bezier(0.0, 0.0, 0.2, 1)";
        element.style.transform = "scale(" + size * 1.1 + ")";
        window.setTimeout(function () {
            element.style.transform = "scale(" + size + ")";
            // Check again if element is still alive
            if (element)
                window.setTimeout(ripple_bounce, 1200, element, event, size);
        }, 1200);
    }
}

function ripple_size(height, width) {
    return (Math.max(height, width) * 0.8) / 16;
}

function relative_click_coordinates(event) {
    var rect = event.currentTarget.getBoundingClientRect();
    return {
        x: event.pageX - rect.left,
        y: event.pageY - rect.top
    };
}

function applyStylesToRipple(element, event) {
    const parent_height = event.currentTarget.clientHeight,
        parent_width = event.currentTarget.clientWidth,
        size = ripple_size(
            event.currentTarget.clientHeight,
            event.currentTarget.clientWidth
        );

    const coords = relative_click_coordinates(event);
    element.style.top = coords.y - 8 + "px";
    element.style.left = coords.x - 8 + "px";
    element.style.transition = "500ms cubic-bezier(0.4, 0, 0.2, 1)";
    window.setTimeout(function () {
        element.style.transform = "scale(" + size + ")";
        element.style.top = parent_height / 2 - 8 + "px";
        element.style.left = parent_width / 2 - 8 + "px";
        window.setTimeout(function () {
            ripple_bounce(element, event, size);
        }, 500);
    }, 10);
}

function ripple_cleanup(ripple) {
    ripple.setAttribute("removal-scheduled", "f");
    window.setTimeout(function () {
        ripple.style.transition = "1200ms cubic-bezier(0, 0, 0.2, 1)";
        ripple.style.opacity = 0;
        ripple.style.width = "32px";
        ripple.style.height = "32px";
        window.setTimeout(function () {
            // Tofix: element does not get deleted
            if (ripple)
                ripple.parentNode.removeChild(ripple);
        }, 750);
    }, 120);
}

function create_ripple(parent) {
    const ripple_element = document.createElement("div");
    ripple_element.classList = "_inkSplash";
    parent.append(ripple_element);

    //Have to fetch newly appended element instead of sending rippleElement because it'll just be a copy otherwise
    return parent.lastChild;
}

function ripple_event_handler(event) {
    if (rippling_allowed) {
        rippling_allowed = false;
        const t = event.currentTarget;
        const ripple_element = create_ripple(t);
        applyStylesToRipple(ripple_element, event);
        window.setTimeout(function () {
            rippling_allowed = true;
        }, 15);
    }
}

function ripple_init() {
    "use strict";
    const ripple_containers = [].slice.call(
        document.getElementsByClassName("ripple")
    );

    //Apply event listener to each of the rippleContainers
    ripple_containers.forEach(function (element) {
        element.addEventListener("mousedown", function (event) {
            ripple_event_handler(event);
        });

        element.addEventListener("touchstart", function (event) {
            ripple_event_handler(event);
        });

        element.addEventListener("mouseleave", function (event) {
            delete_all_ripples();
        });
    });
    set_up_ripple_cleanup();
}

// To stop both events from firing
var rippling_allowed = true;
var deleting_ripples_allowed = true;

function delete_all_ripples() {
    if (deleting_ripples_allowed) {
        deleting_ripples_allowed = false;
        const targets = document.getElementsByClassName("_inkSplash");
        for (let target of targets) {
            if (!target.hasAttribute("removal-scheduled"))
                ripple_cleanup(target);
        }
        window.setTimeout(function () {
            deleting_ripples_allowed = true;
        }, 10);
    }
}

function hide_menu(event) {
    if (!event.target.classList.contains("toolbar-menu") &&
        !event.target.classList.contains("toolbar-menu-option")) {
        document.getElementById("menu-button")
            .classList.remove("active");
        // Todo: Make it gain activity as well
    }
}

function set_up_ripple_cleanup() {
    document.addEventListener("mouseup", function (event) {
        delete_all_ripples();
        //hide_menu(event);
    });

    document.addEventListener("touchend", function (event) {
        delete_all_ripples();
        //hide_menu();
    });
}