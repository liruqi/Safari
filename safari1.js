/*
 * Copyright (c) 2010 Apple Inc. All rights reserved.
 */
function updateFindInPageMarkers() {
    ReaderJSController.updateFindInPageMarkers()
}
function setCurrentTextZoomIndex(e, t) {
    ReaderAppearanceJS.setCurrentTextSizeIndex(e, t ? ShouldSaveConfiguration.Yes : ShouldSaveConfiguration.No), updateFindInPageMarkers()
}
function setConfiguration(e) {
    ReaderAppearanceJS.applyConfiguration(e)
}
function setFontFamily(e) {
    ReaderAppearanceJS.setFontFamily(e)
}
function setScrollTop(e) {
    document.documentElement.scrollTop = e
}
function printArticle() {
    ReaderJSController.printArticle()
}
function getArticleScrollPosition() {
    scrollInfo = {}, scrollInfo.version = 1;
    var e = document.getElementsByClassName("page");
    if (!e.length)
        return scrollInfo.pageIndex = 0, scrollInfo;
    scrollInfo.pageIndex = e.length - 1;
    var t = window.scrollY, n;
    for (n = 0; n < e.length; n++) {
        var r = e[n];
        if (r.offsetTop + r.offsetHeight >= t) {
            scrollInfo.pageIndex = n;
            break
        }
    }
    return scrollInfo
}
function restoreInitialArticleScrollPosition() {
    var e = document.getElementsByClassName("page"), t = e[initialScrollPosition.pageIndex];
    if (!t)
        return;
    var n = t.offsetTop - window.scrollY;
    smoothScroll(n, PageScrollDuration)
}
function restoreInitialArticleScrollPositionIfPossible() {
    if (didRestoreInitialScrollPosition)
        return;
    if (!initialScrollPosition) {
        initialScrollPosition = ReaderJSController.initialArticleScrollPosition();
        if (!initialScrollPosition ||!initialScrollPosition.pageIndex) {
            didRestoreInitialScrollPosition=!0;
            return 
        }
    }
    var e = document.getElementsByClassName("page-number").length;
    if (initialScrollPosition.pageIndex >= e)
        return;
    setTimeout(restoreInitialArticleScrollPosition, DelayBeforeRestoringScrollPositionInMs), didRestoreInitialScrollPosition=!0
}
function updatePageNumbers() {
    var e = document.getElementsByClassName("page-number"), t = e.length;
    for (var n = 0; n < t; n++)
        ReaderJS.isLoadingNextPage() ? e[n].textContent = getLocalizedString("Page %@").format(n + 1) : e[n].textContent = getLocalizedString("Page %@ of %@").format(n + 1, t)
}
function incomingPagePlaceholder() {
    return document.getElementById("incoming-page-placeholder")
}
function addIncomingPagePlaceholder() {
    var e = document.createElement("div");
    e.className = "page", e.id = "incoming-page-placeholder";
    var t = document.createElement("div");
    t.id = "incoming-page-corner";
    var n = document.createElement("div");
    n.id = "incoming-page-text", n.innerText = getLocalizedString("Loading Next Page\u2026"), t.appendChild(n), e.appendChild(t), document.getElementById("article").appendChild(e)
}
function removeIncomingPagePlaceholder() {
    var e = incomingPagePlaceholder();
    e.parentNode.removeChild(e)
}
function nextPageLoadComplete() {
    nextPageContainer().removeEventListener("load", nextPageLoadComplete, !1), ReaderJS.pageNumber++;
    if (ReaderJS.readerOperationMode == ReaderOperationMode.OffscreenFetching) {
        var e = ReaderJS.pageURLs[ReaderJS.pageURLs.length - 1];
        ReaderJSController.nextPageLoadComplete(ReaderJS.pageNumber, e, "next-page-container")
    }
    ReaderJSController.prepareNextPageFrame("next-page-container");
    var t = ReaderJSController.nextPageArticleFinder();
    t.pageNumber = ReaderJS.pageNumber, t.suggestedRouteToArticle = ReaderJS.routeToArticle, t.previouslyDiscoveredPageURLStrings = ReaderJS.pageURLs;
    var n = t.adoptableArticle();
    n && (ReaderJS.createPageFromNode(n), ReaderJS.routeToArticle = t.routeToArticleNode()), nextPageContainer().removeAttribute("src"), ReaderJS.setNextPageURL(t.nextPageURL()), ReaderJSController.clearNextPageArticleFinder(), updatePageNumbers(), restoreInitialArticleScrollPositionIfPossible(), ReaderJS.isLoadingNextPage() || ReaderJS.doneLoadingAllPages()
}
function nextPageContainer() {
    return document.getElementById("next-page-container")
}
function getLocalizedString(e) {
    var t = localizedStrings[e];
    return t ? t : e
}
function deactivateIfEventIsOutsideOfPaperContainer(e) {
    e && ReaderAppearanceJS.usesPaperAppearance()&&!document.getElementById("article").contains(e.target) && deactivateReader()
}
function deactivateReader() {
    ReaderJS.isLoadingNextPage() && ReaderJS.stopLoadingNextPage(), ReaderJSController.deactivateNow()
}
function renameAttributeOnElementsMatchingSelector(e, t, n) {
    var r = document.querySelectorAll(n);
    for (var i = 0; i < r.length; ++i) {
        var s = r[i], o = s.getAttribute(e);
        o && (s.setAttribute(t, o), s.removeAttribute(e))
    }
}
function readerWillBecomeVisible() {
    document.body.classList.remove("cached"), renameAttributeOnElementsMatchingSelector("cached-src", "src", "iframe")
}
function resetForPotentialReactivation() {
    if (ReaderJS.isLoadingNextPage() || ReaderJS.loadingNextPageManuallyStopped)
        return !1;
    var e = document.querySelectorAll("audio, video");
    for (var t = 0; t < e.length; t++)
        e[t].pause();
    return renameAttributeOnElementsMatchingSelector("src", "cached-src", "iframe"), document.body.classList.add("cached"), !0
}
function articleHasScrolled() {}
const LoadNextPageDelay = 250, MaxNumberOfNextPagesToLoad = 80;
var ReaderOperationMode = {
    Normal: 0,
    OffscreenFetching: 1,
    ArchiveViewing: 2
};
ReaderController = function() {
    this.pageNumber = 1, this.pageURLs = [], this.articleIsLTR=!0, this.loadingNextPage=!1, this.loadingNextPageManuallyStopped=!1
}, ReaderController.prototype = {
    shouldAnimate: function() {
        return this.readerOperationMode != ReaderOperationMode.OffscreenFetching
    },
    setOriginalURL: function(t) {
        this.originalURL = t, this.pageURLs.push(t), document.head.getElementsByTagName("base")[0].href = this.originalURL
    },
    setNextPageURL: function(t) {
        if (!t || this.pageURLs.indexOf(t)!==-1 || this.pageNumber + 1 === MaxNumberOfNextPagesToLoad) {
            this.setLoadingNextPage(!1);
            return 
        }
        this.setLoadingNextPage(!0), this.pageURLs.push(t);
        var n = function() {
            nextPageContainer().addEventListener("load", nextPageLoadComplete, !1), nextPageContainer().src = t
        };
        this.readerOperationMode == ReaderOperationMode.OffscreenFetching ? n() : this.nextPageLoadTimer = setTimeout(n, LoadNextPageDelay)
    },
    stopLoadingNextPage: function() {
        nextPageContainer().removeEventListener("load", nextPageLoadComplete, !1), nextPageContainer().src = null, this.nextPageLoadTimer && clearTimeout(this.nextPageLoadTimer), this.setLoadingNextPage(!1), this.loadingNextPageManuallyStopped=!0
    },
    isLoadingNextPage: function() {
        return this.loadingNextPage
    },
    setLoadingNextPage: function(t) {
        if (this.loadingNextPage == t)
            return;
        t ? addIncomingPagePlaceholder() : removeIncomingPagePlaceholder(), this.loadingNextPage = t, ReaderJSController.didChangeNextPageLoadingState(this.loadingNextPage)
    },
    doneLoadingAllPages: function() {
        this.readerOperationMode == ReaderOperationMode.OffscreenFetching && resetForPotentialReactivation();
        var t = document.getElementById("article"), n = window.getComputedStyle(t).borderTop;
        t.style.borderBottomWidth = parseInt(n) + "px", ReaderJSController.doneLoadingReaderPage()
    },
    loaded: function() {
        this.readerOperationMode = ReaderJSController.readerOperationMode();
        if (!ReaderJSController.originalArticleFinder()) {
            ReaderJSController.deactivateNow();
            return 
        }
        this.loadArticle(), document.documentElement.addEventListener("click", deactivateIfEventIsOutsideOfPaperContainer), ReaderAppearanceJS.initialize(), ReaderJSController.contentIsReadyForDisplay(this._bestLocale)
    },
    loadArticle: function() {
        var t = ReaderJSController.originalArticleFinder();
        t.article || t.articleNode(!0);
        if (!t.article) {
            this.setOriginalURL(t.contentDocument.baseURI), this.doneLoadingAllPages();
            return 
        }
        this.routeToArticle = t.routeToArticleNode(), this.displayTitle = t.articleTitle(), this.articleIsLTR = t.articleIsLTR();
        var n = t.adoptableArticle().ownerDocument;
        document.title = n.title, this.setOriginalURL(n.baseURI);
        if (this.readerOperationMode == ReaderOperationMode.ArchiveViewing)
            return;
        var r = t.nextPageURL();
        this.setNextPageURL(r);
        var i = t.adoptableArticle();
        this.updateLocaleFromElement(i), this.createPageFromNode(i), r || (t.adoptableMultiPageContentElements().forEach(this.createPageFromNode, this), updatePageNumbers()), this.isLoadingNextPage() || this.doneLoadingAllPages()
    },
    loadNewArticle: function() {
        if (!ReaderJSController.originalArticleFinder()) {
            ReaderJSController.deactivateNow();
            return 
        }
        var t = document.getElementById("article");
        window.scrollY = 0;
        while (t.childNodes.length >= 1)
            t.removeChild(t.firstChild);
        this.reinitialize(), this.loadArticle()
    },
    reinitialize: function() {
        this.pageNumber = 1, this.pageURLs = [], this.articleIsLTR=!0, this.loadingNextPage=!1, this.loadingNextPageManuallyStopped=!1, this.routeToArticle = undefined, this.displayTitle = undefined, this.originalURL = undefined, this.nextPageLoadTimer = undefined, this.readerOperationMode = ReaderJSController.readerOperationMode()
    },
    createPageFromNode: function(t) {
        var n = document.createElement("div");
        n.className = "page", this.articleIsLTR || n.classList.add("rtl");
        var r = document.createElement("div");
        r.className = "page-number", n.appendChild(r);
        var i = document.createElement("h1");
        i.className = "title", i.textContent = this.displayTitle, n.appendChild(i);
        while (t.firstChild)
            n.appendChild(t.firstChild);
        var s = document.getElementById("article");
        s.insertBefore(n, incomingPagePlaceholder()), replaceSimpleTweetsWithRichTweets(), ReaderAppearanceJS.layOutContent(), updatePageNumbers(), restoreInitialArticleScrollPositionIfPossible();
        var o = n.querySelectorAll("img"), u = o.length;
        for (var a = 0; a < u; ++a)
            o[a].onload = function(e) {
                var t = e.target;
                ReaderAppearanceJS.setImageShouldLayOutBeyondTextColumnIfAppropriate(t, ReaderAppearanceJS.canLayOutContentMaintainingAspectRatioBeyondTextColumn()), t.onload = null
            }
    },
    removeAttribute: function(t, n) {
        var r = t.querySelectorAll("[" + n + "]"), i = r.length;
        for (var s = 0; s < i; s++)
            r[s].removeAttribute(n)
    },
    preparePrintingMailingFrame: function() {
        var t = this.printingMailingFrameElementId(), n = document.getElementById(t);
        n && document.body.removeChild(n), n = document.createElement("iframe"), n.id = t, n.style.display = "none", n.style.position = "absolute", document.body.appendChild(n);
        var r = n.contentDocument, i = document.createElement("base");
        i.href = this.originalURL, r.head.appendChild(i);
        var s = document.createElement("div");
        s.className = "original-url";
        var o = document.createElement("a");
        o.href = this.originalURL, o.textContent = this.originalURL, s.appendChild(o), s.appendChild(document.createElement("br")), s.appendChild(document.createElement("br")), r.body.appendChild(s), r.body.appendChild(this.sanitizedFullArticle()), r.head.appendChild(document.getElementById("article-content").cloneNode(!0));
        var u = r.createElement("title");
        u.innerText = document.title, r.head.appendChild(u)
    },
    sanitizedFullArticle: function() {
        var e = document.getElementById("article").cloneNode(!0);
        e.removeAttribute("tabindex");
        var t = e.querySelectorAll(".title");
        for (var n = 1; n < t.length; ++n)
            t[n].parentNode.removeChild(t[n]);
        var r = e.querySelectorAll(".page-number, #incoming-page-placeholder");
        for (var n = 0; n < r.length; n++)
            r[n].parentNode.removeChild(r[n]);
        prepareTweetsInPrintingMailingFrame(e);
        var i = e.querySelectorAll(".extendsBeyondTextColumn"), s = i.length;
        for (var n = 0; n < s; ++n)
            stopExtendingElementBeyondTextColumn(i[n]);
        return e
    },
    printingMailingFrameElementId: function() {
        return "printing-mailing-frame"
    },
    updateLocaleFromElement: function(t) {
        this._bestLocale = localeForElement(t), document.getElementById("article").style.webkitLocale = "'" + this._bestLocale + "'"
    }
};
const PageScrollDuration = 800, DelayBeforeRestoringScrollPositionInMs = 1e3;
var didRestoreInitialScrollPosition=!1, initialScrollPosition;
window.addEventListener("resize", function() {
    ReaderAppearanceJS.applyAppropriateFontSize(), ReaderAppearanceJS.layOutContent()
}, !1);
const DefaultFontFamilyName = "Georgia";
var ReaderAppearanceJS = new ReaderAppearanceController;
ReaderAppearanceJS._defaultFontFamilyName = DefaultFontFamilyName;
var ReaderJS = new ReaderController;

