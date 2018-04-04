# sketch-nibui

A library for Sketch plugins that lets you load UI views from NIB files built with Interface Builder.

# Basic usage

This library is designed for use with [skpm](https://github.com/skpm/skpm).

1. Install the library in your plugin code:
   ```
   npm install --save sketch-nibui
   ```

2. Create an XIB file in Interface Builder with a single top-level `NSView`.

3. Convert the XIB to a NIB and place it in your plugin's `assets` directory:
   ```
   ibtool --compile assets/MyUI.nib MyUI.xib
   ```
   *Note: I'm hoping to automate this in the future with a custom webpack plugin or loader for skpm*.

4. Load the views in your plugin code using `nibui.load()`, which returns an object with a `rootView`
   property set to the top-level `NSView` in your NIB if successful.
   ```
   const nibui = require('sketch-nibui');

   export default function(context) {
     let nib = nibui.load(context, 'MyUI'); // MyUI.nib
     let dialog = NSAlert.alloc().init();
     dialog.setAccessoryView(nib.rootView);
     ...
     dialog.runModal();
   }
   ```

## Quick access to subviews:

You'll likely want to access subviews under your top-level `NSView`. To do that:

1. In Interface Builder, select the subview and in the **Identity inspector**, set the view's **Identifier**
   to an ID like `myView`.

2. Access it using `nib.views.myView`

## Handling events

You can pair this library with something like [MochaJSDelegate](https://github.com/matt-curtis/MochaJSDelegate)
to attach event handlers to your views.

*Hint: you can use the delegate for button clicks using `yourButton.setTarget(delegate)` and
`yourButton.setAction(NSSelectorFromString('yourClickAction:'));`*
