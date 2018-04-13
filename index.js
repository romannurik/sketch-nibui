/*
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function load(context, nibName) {
  return new NibUI(context, nibName);
}

class NibUI {
  constructor(context, nibName) {
    let bundle = NSBundle.bundleWithURL(context.plugin.url());

    // register a class that doesn't exist yet. note that we can't reuse the same
    // definition lest Sketch will throw an MOJavaScriptException when binding the UI,
    // probably due to JavaScript context / plugin lifecycle incompatibility

    let tempClassName;
    while (true) {
      tempClassName = 'NibOwner' + randomId();
      if (NSClassFromString(tempClassName) == null) {
        break;
      }
    }

    this.cls_ = MOClassDescription.allocateDescriptionForClassWithName_superclass_(
        tempClassName, NSClassFromString('NSObject'));
    this.cls_.registerClass();
    this.nibOwner_ = NSClassFromString(tempClassName).alloc().init();

    let tloPointer = MOPointer.alloc().initWithValue(null);

    if (bundle.loadNibNamed_owner_topLevelObjects_(nibName, this.nibOwner_, tloPointer)) {
      let topLevelObjects = tloPointer.value();
      for (var i = 0; i < topLevelObjects.count(); i++) {
        let obj = topLevelObjects.objectAtIndex(i);
        if (obj.className().endsWith('View')) {
          this.rootView = obj;
          break;
        } else if (obj.className().endsWith('Window')) {
          this.rootWindow = obj;
          break;
        }
      }
    } else {
      throw new Error(`Error loading nib file ${nibName}.nib`);
    }

    // populate view IDs
    this.views = {};
    if (this.rootWindow != null) {
      this.rootView = this.rootWindow.contentView();
    }
    walkViewTree(this.rootView, view => {
      let id = String(view.identifier());
      if (id && !id.startsWith('_')) {
        this.views[id] = view;
      }
    });
  }
}

/**
 * Depth-first traversal for NSViews.
 */
function walkViewTree(rootView, fn) {
  let visit_ = view => {
    fn(view);

    let nsArray = view.subviews();
    let count = nsArray.count();
    for (let i = 0; i < count; i++) {
      visit_(nsArray.objectAtIndex(i));
    }
  };

  visit_(rootView);
}

/**
 * Generates a random unsigned integer.
 */
function randomId() {
  return (1000000 * Math.random()).toFixed(0);
}
