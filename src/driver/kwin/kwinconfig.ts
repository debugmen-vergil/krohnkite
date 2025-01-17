// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

class KWinConfig implements IConfig {
  //#region Layout
  public layoutOrder: string[];
  public layoutFactories: { [key: string]: () => ILayout };
  public maximizeSoleTile: boolean;
  public monocleMaximize: boolean;
  public monocleMinimizeRest: boolean; // kwin.specific
  //#endregion

  //#region Features
  public adjustLayout: boolean;
  public adjustLayoutLive: boolean;
  public keepFloatAbove: boolean;
  public noTileBorder: boolean;
  public limitTileWidthRatio: number;
  //#endregion

  //#region Gap
  public screenGapBottom: number;
  public screenGapLeft: number;
  public screenGapRight: number;
  public screenGapTop: number;
  public tileLayoutGap: number;
  //#endregion

  //#region Behavior
  public directionalKeyMode: "dwm" | "focus";
  public newWindowAsMaster: boolean;
  //#endregion

  //#region kwin.specific
  public layoutPerActivity: boolean;
  public layoutPerDesktop: boolean;
  public preventMinimize: boolean;
  public preventProtrusion: boolean;
  public pollMouseXdotool: boolean;
  //#endregion

  //#region kwin.specific Rules
  public floatUtility: boolean;

  public floatingClass: string[];
  public floatingTitle: string[];
  public ignoreClass: string[];
  public ignoreTitle: string[];
  public ignoreRole: string[];

  public ignoreActivity: string[];
  public ignoreScreen: string[];
  //#endregion

  constructor() {
    function commaSeparate(str: string): string[] {
      if (!str || typeof str !== "string") return [];
      return str.split(",").map((part) => part.trim());
    }

    DEBUG.enabled = DEBUG.enabled || KWIN.readConfig("debug", false);

    this.layoutOrder = [];
    this.layoutFactories = {};
    (
      [
        ["enableTileLayout", true, TileLayout],
        ["enableMonocleLayout", true, MonocleLayout],
        ["enableThreeColumnLayout", true, ThreeColumnLayout],
        ["enableSpreadLayout", true, SpreadLayout],
        ["enableStairLayout", true, StairLayout],
        ["enableSpiralLayout", true, SpiralLayout],
        ["enableQuarterLayout", false, QuarterLayout],
        ["enableFloatingLayout", false, FloatingLayout],
        ["enableCascadeLayout", false, CascadeLayout], // TODO: add config
      ] as Array<[string, boolean, ILayoutClass]>
    ).forEach(([configKey, defaultValue, layoutClass]) => {
      if (KWIN.readConfig(configKey, defaultValue))
        this.layoutOrder.push(layoutClass.id);
      this.layoutFactories[layoutClass.id] = () => new layoutClass();
    });

    this.maximizeSoleTile = KWIN.readConfig("maximizeSoleTile", false);
    this.monocleMaximize = KWIN.readConfig("monocleMaximize", true);
    this.monocleMinimizeRest = KWIN.readConfig("monocleMinimizeRest", false);

    this.adjustLayout = KWIN.readConfig("adjustLayout", true);
    this.adjustLayoutLive = KWIN.readConfig("adjustLayoutLive", true);
    this.keepFloatAbove = KWIN.readConfig("keepFloatAbove", true);
    this.noTileBorder = KWIN.readConfig("noTileBorder", false);

    this.limitTileWidthRatio = 0;
    if (KWIN.readConfig("limitTileWidth", false))
      this.limitTileWidthRatio = KWIN.readConfig("limitTileWidthRatio", 1.6);

    this.screenGapBottom = KWIN.readConfig("screenGapBottom", 0);
    this.screenGapLeft = KWIN.readConfig("screenGapLeft", 0);
    this.screenGapRight = KWIN.readConfig("screenGapRight", 0);
    this.screenGapTop = KWIN.readConfig("screenGapTop", 0);
    this.tileLayoutGap = KWIN.readConfig("tileLayoutGap", 0);

    const directionalKeyDwm = KWIN.readConfig("directionalKeyDwm", true);
    const directionalKeyFocus = KWIN.readConfig("directionalKeyFocus", false);
    this.directionalKeyMode = directionalKeyDwm ? "dwm" : "focus";
    this.newWindowAsMaster = KWIN.readConfig("newWindowAsMaster", false);

    this.layoutPerActivity = KWIN.readConfig("layoutPerActivity", true);
    this.layoutPerDesktop = KWIN.readConfig("layoutPerDesktop", true);
    this.floatUtility = KWIN.readConfig("floatUtility", true);
    this.preventMinimize = KWIN.readConfig("preventMinimize", false);
    this.preventProtrusion = KWIN.readConfig("preventProtrusion", true);
    this.pollMouseXdotool = KWIN.readConfig("pollMouseXdotool", false);

    this.floatingClass = commaSeparate(KWIN.readConfig("floatingClass", ""));
    this.floatingTitle = commaSeparate(KWIN.readConfig("floatingTitle", ""));
    this.ignoreActivity = commaSeparate(KWIN.readConfig("ignoreActivity", ""));
    this.ignoreClass = commaSeparate(
      KWIN.readConfig("ignoreClass", "krunner,yakuake,spectacle,kded5")
    );
    this.ignoreRole = commaSeparate(KWIN.readConfig("ignoreRole", "quake"));

    this.ignoreScreen = commaSeparate(KWIN.readConfig("ignoreScreen", ""));
    this.ignoreTitle = commaSeparate(KWIN.readConfig("ignoreTitle", ""));

    if (this.preventMinimize && this.monocleMinimizeRest) {
      debug(
        () => "preventMinimize is disabled because of monocleMinimizeRest."
      );
      this.preventMinimize = false;
    }
  }

  public toString(): string {
    return "Config(" + JSON.stringify(this, undefined, 2) + ")";
  }
}

// /* HACK: save casting */
var KWINCONFIG: KWinConfig;
