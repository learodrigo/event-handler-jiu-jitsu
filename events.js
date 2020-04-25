// Middleware between the event handler and what to do with the data
function scrollMiddleWare (inertia = 0.8) {
  let prevEvent;

  // Handling delta in an object, saves memory is on garbage collection
  const delta = {
    x: null,
    y: null,
  };

  // Tracking absolute values of delta
  const abs = {
    x: 0,
    y: 0,
  };

  /**
   * Currying: breaking a function taking many arguments into many smaller functions
   * It's a functional pattern for replacing configuration objects
   */
  return function onScroll (callback) {
    // Handles the start/stop animation
    let requestId;

    // Handles animation
    function notify () {
      abs.x += delta.x
      abs.y += delta.y
      callback({delta, abs});
    }

    // Starts animation
    function start () {
      /**
       * The window.requestAnimationFrame() method tells the browser that you wish
       * to perform an animation and requests that the browser calls a specified
       * function to update an animation before the next repaint. The method takes
       * a callback as an argument to be invoked before the repaint.
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
       */
      requestId = requestAnimationFrame(update);
    }

    // Stops animation
    function stop () {
      /**
       * The window.cancelAnimationFrame() method cancels an animation frame request
       * previously scheduled through a call to window.requestAnimationFrame().
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/window/cancelAnimationFrame
       */
      cancelAnimationFrame(requestId);
      requestId = undefined;
    }

    // Runs notify and starts again
    function update () {
      // Applying stopping force
      delta.x *= inertia;
      delta.y *= inertia;
      notify();
      start();
    }

    return () => {
      // Taking out default, in this case is selection
      event.preventDefault();
      // event.buttons === 1 is left click
      if (prevEvent && event.buttons === 1) {
        // event.clientX - position of mouse pointer in relation to browser
        delta.x = event.clientX - prevEvent.clientX;
        delta.y = event.clientY - prevEvent.clientY;
        stop();
        notify();
      }

      // If we haven't started yet and any button is being pressed, start
      if (!requestId && !event.buttons) start();

      // Setting previous event
      prevEvent = event;
    }
  }
}

scrollable.addEventListener('mousemove', scrollMiddleWare(0.95)(scroll => {
  // Applying scrolling to div container
  items.style.left = `${scroll.abs.x}px`;
  // applying rotation to every li
  // Array.from creates an array with the given element
  Array.from(items.children).forEach(item => {
    item.style.transform = [
      // `rotateX(${scroll.abs.y}deg)`,
      // `rotateY(${scroll.abs.x}deg)`
    ].join(' ');
  });
}));
