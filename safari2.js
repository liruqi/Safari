/*
 * Copyright (c) 2010 Apple Inc. All rights reserved.
 */
function articleHeight() {
    var e = document.getElementById("article").offsetHeight, t = parseInt(getComputedStyle(document.getElementById("article")).marginTop);
    return e + 2 * t
}
function smoothScroll(e, t, n, r) {
    function l(t, n, r, i) {
        scrollEventIsSmoothScroll=!0, e.scrollTop = n, setTimeout(function() {
            scrollEventIsSmoothScroll=!1
        }, 0)
    }
    const i = 1e3 / 60;
    var s = e.scrollTop, o = s + t, u = 0, a = articleHeight() - window.innerHeight;
    o < u && (o = u), o > a && (o = a);
    if (s == o)
        return;
    var f = Math.abs(o - s);
    f < Math.abs(t) && (n = n * f / Math.abs(t));
    if (smoothScrollingAnimator) {
        var c = smoothScrollingAnimator.animations[0], h = c.progress, p = h > .5 ? 1 - h: h, d = n / (1 - p), v =- p * d, m = o - s, g = m * .5 * Math.PI * Math.sin(Math.PI * h), y = Math.sin(Math.PI / 2 * p), b = y * y, w = (s - o * b) / (1 - b);
        abortSmoothScroll(), smoothScrollingAnimator = new AppleAnimator(d, i, r), smoothScrollingAnimation = new AppleAnimation(w, o, l), smoothScrollingAnimator.addAnimation(smoothScrollingAnimation), smoothScrollingAnimator.start(v);
        return 
    }
    smoothScrollingAnimator = new AppleAnimator(n, i, r), smoothScrollingAnimation = new AppleAnimation(s, o, l), smoothScrollingAnimator.addAnimation(smoothScrollingAnimation), smoothScrollingAnimator.start()
}
function abortSmoothScroll() {
    smoothScrollingAnimator.stop(AnimationTerminationCondition.Interrupted), smoothScrollingAnimator = null, smoothScrollingAnimation = null
}
function articleScrolled() {
    !scrollEventIsSmoothScroll && smoothScrollingAnimator && abortSmoothScroll(), ReaderJSController.articleScrolled()
}
function shouldIgnoreElementWhileTraversingReaderContent(e) {
    return e ? e.classList.contains("page-number") || e.classList.contains("float") || e.tagName === "HR" || e.offsetHeight === 0 : !1
}
function traverseReaderContent(e, t, n) {
    if (!e)
        return;
    var r = e;
    while (r = r.parentElement)
        if (r.className === "page")
            break;
    var i = e;
    while (i = i[t])
        if (!shouldIgnoreElementWhileTraversingReaderContent(i))
            break;
    if (i)
        return i;
    i = r[t];
    if (!i || i.className !== "page")
        return null;
    i = i[n];
    do 
        if (!shouldIgnoreElementWhileTraversingReaderContent(i))
            break;
    while (i = i[t]);
    return i
}
function nextReaderContentElement(e) {
    return traverseReaderContent(e, "nextElementSibling", "firstElementChild")
}
function previousReaderContentElement(e) {
    return traverseReaderContent(e, "previousElementSibling", "lastElementChild")
}
function keyDown(e) {
    var t=!e.metaKey&&!e.altKey&&!e.ctrlKey&&!e.shiftKey, n=!e.metaKey&&!e.altKey&&!e.ctrlKey && e.shiftKey;
    switch (e.keyCode) {
    case 8:
        n ? (ReaderJSController.goForward(), e.preventDefault()) : t && (ReaderJSController.goBack(), e.preventDefault());
        break;
    case 74:
        ContentAwareScrollerJS.scroll(ContentAwareNavigationDirection.Down);
        break;
    case 75:
        ContentAwareScrollerJS.scroll(ContentAwareNavigationDirection.Up)
    }
}
function makeWideElementsScrollable() {
    var e = document.querySelectorAll("table, pre"), t = e.length;
    for (var n = 0; n < t; ++n) {
        var r = e[n];
        if (r.classList.contains("float"))
            continue;
        if (r.parentElement.classList.contains("scrollable"))
            continue;
        var i = document.createElement("div");
        r.parentElement.insertBefore(i, r), r.remove(), i.insertBefore(r), i.classList.add("scrollable")
    }
}
function loadTwitterJavaScript() {
    window.twttr = function(e, t, n) {
        var r, i, s = e.getElementsByTagName(t)[0];
        if (e.getElementById(n))
            return;
        return i = e.createElement(t), i.id = n, i.src = "https://platform.twitter.com/widgets.js", s.parentNode.insertBefore(i, s), window.twttr || (r = {
            _e: [],
            ready: function(e) {
                r._e.push(e)
            }
        })
    }(document, "script", "twitter-wjs")
}
function richTweetWasCreated(e) {
    var t = e.parentNode.querySelector(".simple-tweet");
    t.classList.add("hidden")
}
function replaceSimpleTweetsWithRichTweets() {
    var e = document.querySelectorAll("[data-reader-tweet-id]"), t = e.length;
    if (!t)
        return;
    loadTwitterJavaScript(), twttr.ready(function(n) {
        for (var r = 0; r < t; ++r) {
            var i = e[r];
            n.widgets.createTweet(i.getAttribute("data-reader-tweet-id"), i, {
                dnt: !0
            }).then(richTweetWasCreated)
        }
    })
}
function prepareTweetsInPrintingMailingFrame(e) {
    var t = e.querySelectorAll(".tweet-wrapper"), n = t.length;
    for (var r = 0; r < n; ++r) {
        var i = t[r], s = i.querySelector("iframe");
        s && s.remove();
        var o = i.querySelector(".simple-tweet");
        o && o.classList.remove("hidden")
    }
}
function localeForElement(e) {
    var t = ReaderJSController.bestLocaleForString(e.textContent);
    return !t ||!t.length || t === "und" ? "en" : t
}
function stopExtendingElementBeyondTextColumn(e) {
    e.classList.remove("extendsBeyondTextColumn"), e.style.removeProperty("width"), e.style.removeProperty("margin-left")
}
function extendElementBeyondTextColumn(e, t, n, r) {
    r || (r = 0), e.classList.add("extendsBeyondTextColumn"), e.style.setProperty("width", t + "px"), e.style.setProperty("margin-left", (n - t) / 2 + r + "px")
}
function textSizeIndexIsValid(e) {
    return typeof e == "number" && MinTextZoomIndex <= e && e <= MaxTextZoomIndex
}
String.prototype.format = function() {
    var e = this.split("%@");
    for (var t = 0; t < arguments.length; ++t)
        e.splice(t * 2 + 1, 0, arguments[t].toString());
    return e.join("")
};
var AnimationTerminationCondition = {
    Interrupted: 0,
    CompletedSuccessfully: 1
};
AppleAnimator = function(e, t, n) {
    this.startTime = 0, this.duration = e, this.interval = t, this.animations = [], this.animationFinishedCallback = n, this.currentFrameRequestID = null, this._firstTime=!0;
    var r = this;
    this.animate = function() {
        function e(e, t, n) {
            return e < t ? t : e > n ? n : e
        }
        var t, n, i, n = (new Date).getTime(), s = r.duration, o;
        t = e(n - r.startTime, 0, s), n = t / s, i = .5 - .5 * Math.cos(Math.PI * n), o = t >= s;
        var u = r.animations, a = u.length, f = r._firstTime;
        for (var l = 0; l < a; ++l)
            u[l].doFrame(r, i, f, o, n);
        if (o) {
            r.stop(AnimationTerminationCondition.CompletedSuccessfully);
            return 
        }
        r._firstTime=!1, this.currentFrameRequestID = requestAnimationFrame(r.animate)
    }
}, AppleAnimator.prototype = {
    start: function(t) {
        var n = (new Date).getTime(), r = this.interval;
        this.startTime = n - r, t && (this.startTime += t), this.currentFrameRequestID = requestAnimationFrame(this.animate)
    },
    stop: function(t) {
        this.animationFinishedCallback && this.animationFinishedCallback(t), this.currentFrameRequestID && cancelAnimationFrame(this.currentFrameRequestID)
    },
    addAnimation: function(t) {
        this.animations[this.animations.length] = t
    }
}, AppleAnimation = function(e, t, n) {
    this.from = e, this.to = t, this.callback = n, this.now = e, this.ease = 0, this.progress = 0
}, AppleAnimation.prototype = {
    doFrame: function(t, n, r, i, s) {
        var o;
        i ? o = this.to : o = this.from + (this.to - this.from) * n, this.now = o, this.ease = n, this.progress = s, this.callback(t, o, r, i)
    }
};
var scrollEventIsSmoothScroll=!1, smoothScrollingAnimator, smoothScrollingAnimation;
window.addEventListener("scroll", articleScrolled, !1);
const ContentAwareNavigationMarker = "reader-content-aware-navigation-marker", ContentAwareNavigationAnimationDuration = 200, ContentAwareNavigationElementOffset = 8, ContentAwareNavigationDirection = {
    Up: 0,
    Down: 1
};
ContentAwareScroller = function() {
    this._numberOfContentAwareScrollAnimationsInProgress = 0
}, ContentAwareScroller.prototype = {
    _articleTitleElement: function() {
        return document.querySelector("#article .page .title")
    },
    _contentElementAtTopOfViewport: function() {
        var e = this._articleTitleElement();
        do {
            if (shouldIgnoreElementWhileTraversingReaderContent(e))
                continue;
            if (e.getBoundingClientRect().top < ContentAwareNavigationElementOffset)
                continue;
            return e
        }
        while (e = nextReaderContentElement(e));
        return null
    },
    _clearTargetOfContentAwareScrolling: function() {
        var t = document.getElementById(ContentAwareNavigationMarker);
        t && t.removeAttribute("id")
    },
    _contentAwareScrollFinished: function(e) {
        if (e !== AnimationTerminationCondition.CompletedSuccessfully)
            return;
        --this._numberOfContentAwareScrollAnimationsInProgress;
        if (this._numberOfContentAwareScrollAnimationsInProgress)
            return;
        smoothScrollingAnimator = null, smoothScrollingAnimation = null, this._clearTargetOfContentAwareScrolling()
    },
    scroll: function(e) {
        var t = document.getElementById(ContentAwareNavigationMarker), n = t || this._contentElementAtTopOfViewport(), r, i;
        if (e === ContentAwareNavigationDirection.Down) {
            var s = Math.abs(n.getBoundingClientRect().top - ContentAwareNavigationElementOffset) < 1;
            !t&&!s ? r = n : r = nextReaderContentElement(n)
        } else if (e === ContentAwareNavigationDirection.Up)
            if (n === this._articleTitleElement()) {
                if (document.body.scrollTop === 0)
                    return;
                    i =- 1 * document.body.scrollTop
            } else 
                r = previousReaderContentElement(n);
        r && (i = r.getBoundingClientRect().top - ContentAwareNavigationElementOffset), ++this._numberOfContentAwareScrollAnimationsInProgress, smoothScroll(document.body, i, ContentAwareNavigationAnimationDuration, this._contentAwareScrollFinished.bind(this)), this._clearTargetOfContentAwareScrolling(), r && (r.id = ContentAwareNavigationMarker)
    }
};
var ContentAwareScrollerJS = new ContentAwareScroller;
window.addEventListener("keydown", keyDown, !1);
const DefaultFontSizes = [15, 16, 17, 18, 19, 20, 21, 23, 26, 28, 37, 46], DefaultLineHeights = ["25px", "26px", "27px", "28px", "29px", "30px", "31px", "33px", "37px", "39px", "51px", "62px"], FontSettings = {
    System: {
        fontSizes: DefaultFontSizes,
        lineHeights: ["25px", "26px", "27px", "29px", "30px", "31px", "32px", "33px", "38px", "39px", "51px", "62px"],
        cssClassName: "system"
    },
    Athelas: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "athelas"
    },
    Charter: {
        fontSizes: DefaultFontSizes,
        lineHeights: ["25px", "26px", "27px", "28px", "29px", "30px", "32px", "34px", "38px", "39px", "51px", "62px"],
        cssClassName: "charter"
    },
    Georgia: {
        fontSizes: DefaultFontSizes,
        lineHeights: ["25px", "26px", "27px", "28px", "29px", "30px", "32px", "34px", "38px", "41px", "51px", "62px"],
        cssClassName: "georgia"
    },
    "Iowan Old Style": {
        fontSizes: DefaultFontSizes,
        lineHeights: ["25px", "26px", "27px", "28px", "29px", "30px", "32px", "34px", "38px", "39px", "51px", "62px"],
        cssClassName: "iowan"
    },
    Palatino: {
        fontSizes: DefaultFontSizes,
        lineHeights: ["25px", "26px", "27px", "28px", "29px", "30px", "31px", "34px", "37px", "40px", "51px", "62px"],
        cssClassName: "palatino"
    },
    Seravek: {
        fontSizes: DefaultFontSizes,
        lineHeights: ["25px", "26px", "27px", "28px", "28px", "30px", "31px", "34px", "37px", "39px", "51px", "62px"],
        cssClassName: "seravek"
    },
    "Times New Roman": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "times"
    },
    YuGothic: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "yugothic"
    },
    YuMincho: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "yumincho"
    },
    "Hiragino Kaku Gothic ProN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "hiraginokaku"
    },
    "Hiragino Mincho ProN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "hiraginomincho"
    },
    "Hiragino Maru Gothic ProN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "hiraginomaru"
    },
    "Heiti SC": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "heitisc"
    },
    "Songti SC": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "songtisc"
    },
    "Kaiti SC": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "kaitisc"
    },
    "Yuanti SC": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "yuantisc"
    },
    "Heiti TC": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "heititc"
    },
    "Songti TC": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "songtitc"
    },
    "Kaiti TC": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "kaititc"
    },
    "Apple SD Gothic Neo": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "applesdgothicneo"
    },
    NanumGothic: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "nanumgothic"
    },
    NanumMyeongjo: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "nanummyeongjo"
    },
    "Khmer MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "khmer"
    },
    "Khmer Sangnam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "khmersangnam"
    },
    "Lao MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "lao"
    },
    "Lao Sangnam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "laosangnam"
    },
    Thonburi: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "thonburi"
    },
    Kailasa: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "kailasa"
    },
    "Geeza Pro": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "geezapro"
    },
    Kefa: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "kefa"
    },
    "Arial Hebrew": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "arialhebrew"
    },
    Mshtakan: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "mshtakan"
    },
    "Plantagenet Cherokee": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "plantagenetcherokee"
    },
    "Euphemia UCAS": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "euphemiaucas"
    },
    "Bangla Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "bangla"
    },
    "Gujarati Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "gujarati"
    },
    "Gurmukhi MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "gurmukhi"
    },
    "Devanagari Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "devanagari"
    },
    "Kannada Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "kannada"
    },
    "Malayalam Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "malayalam"
    },
    "Oriya Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "oriya"
    },
    "Sinhala Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "sinhala"
    },
    InaiMathi: {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "inaimathi"
    },
    "Tamil Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "tamil"
    },
    "Telugu Sangam MN": {
        fontSizes: DefaultFontSizes,
        lineHeights: DefaultLineHeights,
        cssClassName: "telugu"
    }
}, ThemeSettings = {
    White: {
        cssClassName: "white"
    },
    Gray: {
        cssClassName: "gray"
    },
    Sepia: {
        cssClassName: "sepia"
    },
    Night: {
        cssClassName: "night"
    }
}, ConfigurationVersion = 4, ShouldSaveConfiguration = {
    No: !1,
    Yes: !0
}, MinTextZoomIndex = 0, MaxTextZoomIndex = 11, MaximumWidthOfImageExtendingBeyondTextContainer = 1050;
ReaderAppearanceController = function() {
    this._revealCachedTopVisibleNode = null, this._defaultTextSizeIndexProducer = function() {
        return 3
    }, this._readerSizeClassProducer = function() {
        return "all"
    }, this._shouldUsePaperAppearance = function() {
        const e = 70;
        return this.articleWidth() + 2 * e < this.documentElementWidth()
    }, this._canLayOutContentBeyondMainTextColumn=!0, this._defaultFontFamilyName = "System", this._defaultThemeName = "White", this.configuration = {}, this._textSizeIndex = null, this._fontFamilyName = this._defaultFontFamilyName, this._themeName = this._defaultThemeName
}, ReaderAppearanceController.prototype = {
    initialize: function() {
        this.applyConfiguration(ReaderJSController.initialConfiguration()), /Macintosh/g.test(navigator.userAgent) ? document.body.classList.add("mac") : document.body.classList.add("ios")
    },
    applyConfiguration: function(e) {
        var t = this._validConfigurationAndValidityFromUntrustedConfiguration(e), n = t[0], r = t[1], i = n.fontSizeIndexForSizeClass[this._readerSizeClassProducer()];
        textSizeIndexIsValid(i) ? this.setCurrentTextSizeIndex(i, ShouldSaveConfiguration.No) : (this.setCurrentTextSizeIndex(this._defaultTextSizeIndexProducer(), ShouldSaveConfiguration.No), r=!1);
        var s = this._locale(), o = n.fontFamilyNameForLanguageTag[s];
        o || (o = this._defaultFontFamilyNameForLanguage(s)), this.setFontFamily(o, ShouldSaveConfiguration.No), this.setTheme(n.themeName, ShouldSaveConfiguration.No), this.configuration = n, r || this._updateSavedConfiguration()
    },
    _validConfigurationAndValidityFromUntrustedConfiguration: function(t) {
        var n = {
            fontSizeIndexForSizeClass: {},
            fontFamilyNameForLanguageTag: {},
            themeName: null
        }, r=!0;
        t || (t = {}, r=!1);
        var i = (t || {}).version;
        if (!i || typeof i != "number" || i < ConfigurationVersion)
            t = {}, r=!1;
        var s = (t || {}).fontSizeIndexForSizeClass;
        if (s && typeof s == "object")
            for (var o in s) {
                var u = s[o];
                if (!textSizeIndexIsValid(u)) {
                    r=!1;
                    continue
                }
                n.fontSizeIndexForSizeClass[o] = u
            } else 
                r=!1;
        var a = t.fontFamilyNameForLanguageTag;
        a && typeof a == "object" ? n.fontFamilyNameForLanguageTag = a : (n.fontFamilyNameForLanguageTag = {}, r=!1);
        var f = t.themeName;
        return f && typeof f == "string" && ThemeSettings[f] ? n.themeName = f : (n.themeName = this._defaultThemeName, r=!1), [n, r]
    },
    _updateSavedConfiguration: function() {
        this.configuration.fontSizeIndexForSizeClass[this._readerSizeClassProducer()] = this._textSizeIndex, this.configuration.fontFamilyNameForLanguageTag[this._locale()] = this._fontFamilyName, this.configuration.themeName = this._themeName;
        var e = this.configuration;
        e.version = ConfigurationVersion, ReaderJSController.didSetConfiguration(e)
    },
    applyAppropriateFontSize: function() {
        var e = this.configuration.fontSizeIndexForSizeClass[this._readerSizeClassProducer()];
        e && this.setCurrentTextSizeIndex(e, ShouldSaveConfiguration.No)
    },
    makeTextLarger: function() {
        this._textSizeIndex < this._currentFontSettings().fontSizes.length - 1 && this.setCurrentTextSizeIndex(this._textSizeIndex + 1, ShouldSaveConfiguration.Yes)
    },
    makeTextSmaller: function() {
        this._textSizeIndex > 0 && this.setCurrentTextSizeIndex(this._textSizeIndex - 1, ShouldSaveConfiguration.Yes)
    },
    articleWidth: function() {
        return document.getElementById("article").getBoundingClientRect().width
    },
    _textColumnWidthInPoints: function() {
        return parseInt(getComputedStyle(document.querySelector("#article .page")).width)
    },
    documentElementWidth: function() {
        return document.documentElement.clientWidth
    },
    setCurrentTextSizeIndex: function(e, t) {
        if (e === this._textSizeIndex)
            return;
        this._textSizeIndex = e, this._rebuildDynamicStyleSheet(), this.layOutContent(), this._revealCachedTopVisibleNode && this._revealCachedTopVisibleNode(), t === ShouldSaveConfiguration.Yes && this._updateSavedConfiguration()
    },
    _currentFontSettings: function() {
        return FontSettings[this._fontFamilyName]
    },
    setFontFamily: function(e, t) {
        var n = document.body, r = FontSettings[e];
        if (n.classList.contains(r.cssClassName))
            return;
        this._fontFamilyName && n.classList.remove(FontSettings[this._fontFamilyName].cssClassName), n.classList.add(r.cssClassName), this._fontFamilyName = e, this.layOutContent(), t === ShouldSaveConfiguration.Yes && this._updateSavedConfiguration()
    },
    _theme: function() {
        return ThemeSettings[this._themeName]
    },
    setTheme: function(e, t) {
        var n = document.body, r = ThemeSettings[e];
        if (n.classList.contains(r.cssClassName))
            return;
        this._theme() && n.classList.remove(this._theme().cssClassName), n.classList.add(r.cssClassName), this._themeName = e, t === ShouldSaveConfiguration.Yes && this._updateSavedConfiguration()
    },
    usesPaperAppearance: function() {
        return document.documentElement.classList.contains("paper")
    },
    layOutContent: function() {
        this._shouldUsePaperAppearance() ? document.documentElement.classList.add("paper") : document.documentElement.classList.remove("paper"), makeWideElementsScrollable();
        if (!this._canLayOutContentBeyondMainTextColumn)
            return;
        this._layOutImagesBeyondTextColumn(), this._layOutElementsContainingTextBeyondTextColumn()
    },
    _layOutImagesBeyondTextColumn: function() {
        var e = this.canLayOutContentMaintainingAspectRatioBeyondTextColumn(), t = article.querySelectorAll("img"), n = t.length;
        for (var r = 0; r < n; ++r)
            this.setImageShouldLayOutBeyondTextColumnIfAppropriate(t[r], e)
    },
    _layOutElementsContainingTextBeyondTextColumn: function() {
        const e = {
            PRE: !0,
            TABLE: !1
        }, t = 22;
        var n = document.querySelectorAll(".scrollable pre, .scrollable table"), r = n.length;
        for (var i = 0; i < r; ++i) {
            var s = n[i], o = s.parentElement;
            for (var u = o; u; u = u.parentElement)
                u.tagName === "BLOCKQUOTE" && u.classList.add("simple");
            stopExtendingElementBeyondTextColumn(o);
            var a = s.scrollWidth, f = this._textColumnWidthInPoints();
            if (a <= f)
                continue;
            var l = getComputedStyle(document.querySelector(".page")), c = 0;
            if (e[s.tagName]) {
                var h = parseFloat(l["-webkit-padding-start"]) + parseFloat(l["-webkit-margin-start"]);
                c = Math.min(h, t)
            }
            var p = Math.min(a, this.articleWidth() - 2 * c), d = 0, u = o.parentElement;
            while (u&&!u.classList.contains("page")) {
                var v = getComputedStyle(u);
                d += parseFloat(v["-webkit-padding-start"]) + parseFloat(v["-webkit-margin-start"]), u = u.parentElement
            }
            extendElementBeyondTextColumn(o, p, f, - d)
        }
    },
    canLayOutContentMaintainingAspectRatioBeyondTextColumn: function() {
        const e = 700;
        if (window.innerHeight >= e)
            return !0;
        const t = 1.25;
        return window.innerWidth / window.innerHeight <= t
    },
    setImageShouldLayOutBeyondTextColumnIfAppropriate: function(e, t) {
        if (t&&!e.closest("blockquote, table, .float")) {
            var n = this._textColumnWidthInPoints(), r, i = parseFloat(e.getAttribute("width"));
            isNaN(i) ? r = e.naturalWidth / window.devicePixelRatio : r = i;
            var s = this.usesPaperAppearance() ? this.articleWidth(): this.documentElementWidth(), o = Math.min(r, Math.min(MaximumWidthOfImageExtendingBeyondTextContainer, s));
            if (o > n) {
                extendElementBeyondTextColumn(e, o, n);
                return 
            }
        }
        stopExtendingElementBeyondTextColumn(e)
    },
    _rebuildDynamicStyleSheet: function() {
        var e = document.getElementById("dynamic-article-content").sheet;
        while (e.cssRules.length)
            e.removeRule(0);
        var t = this._currentFontSettings().fontSizes[this._textSizeIndex] + "px", n = this._currentFontSettings().lineHeights[this._textSizeIndex];
        e.insertRule("#article { font-size: " + t + "; line-height: " + n + "; }")
    },
    _locale: function() {
        var e = document.getElementById("article").style.webkitLocale;
        return e && e.length ? e : ""
    },
    _defaultFontFamilyNameForLanguage: function(e) {
        const t = {
            am: "Kefa",
            ar: "Geeza Pro",
            hy: "Mshtakan",
            bn: "Bangla Sangam MN",
            bo: "Kailasa",
            chr: "Plantagenet Cherokee",
            gu: "Gujarati Sangam MN",
            "pa-Guru": "Gurmukhi MN",
            he: "Arial Hebrew",
            hi: "Devanagari Sangam MN",
            ja: "YuMincho",
            kn: "Kannada Sangam MN",
            km: "Khmer MN",
            ko: "Apple SD Gothic Neo",
            lo: "Lao MN",
            ml: "Malayalam Sangam MN",
            or: "Oriya Sangam MN",
            si: "Sinhala Sangam MN",
            ta: "InaiMathi",
            te: "Telugu Sangam MN",
            th: "Thonburi",
            "zh-Hans": "Heiti SC",
            "zh-Hant": "Heiti TC",
            "iu-Cans": "Euphemia UCAS"
        };
        var n = t[e];
        return n ? n : this._defaultFontFamilyName
    }
};

