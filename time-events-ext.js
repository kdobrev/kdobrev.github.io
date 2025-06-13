const TIME_IN_HOURS = !1;
const ONE_MIN = 6e4;
const FIFTEEN_MINS = 15 * ONE_MIN;
const THIRTY_MINS = 30 * ONE_MIN;
const FOURTYFIVE_MINS = 45 * ONE_MIN;
const ONE_HOUR = 60 * ONE_MIN;
const SIX_HOURS = 6 * ONE_HOUR;
const NINE_HOURS = 9 * ONE_HOUR;
const TEN_HOURS = 10 * ONE_HOUR;
const TAB_QUICK_ENTRY = "quickEntry";
const TAB_EVENT_LIST = "eventList";
const TAB_CREATE_EVENT = "createEvent";
const DEFAULT_WORK_HOURS = 8;
const INDIVIDUAL_WORK_HOURS = (window.MY_WORK_HOURS || DEFAULT_WORK_HOURS) * ONE_HOUR;
const TIME_EVENT_TYPE_CLOCK_IN = "P10";
const TIME_EVENT_TYPE_BEGIN_BREAK = "P15";
const TIME_EVENT_TYPE_END_BREAK = "P25";
const TIME_EVENT_TYPE_CLOCK_OUT = "P20";

function getRandomizedTime(baseTime) {
    const [hours, , ] = baseTime.split(":").map(Number);
    const randomMinutes = Math.floor(Math.random() * 10); // 0, 5, 10, ..., 55
    const randomSeconds = Math.floor(Math.random() * 60); // 0–59
    return `${String(hours).padStart(2, '0')}:${String(randomMinutes).padStart(2, '0')}:${String(randomSeconds).padStart(2, '0')}`;
}

let userSettings = JSON.parse(localStorage.getItem("userSettings")) || {
    defaultTimes: {
        begin: "09:00:00",
        pauseBegin: "12:00:00",
        pauseEnd: "13:00:00",
        end: "18:00:00",
        autoSubmit: !1
    },
    workHoursPerDay: 8
};

// Randomize times
for (let key of ["begin", "pauseBegin", "pauseEnd", "end"]) {
    userSettings.defaultTimes[key] = getRandomizedTime(userSettings.defaultTimes[key]);
}

let messagesExtracted = !1;
let buttonsAdded = !1;
let buttonContainer, configContainer, currentLanguage = "de";
let languageDetected = !1;
const translations = {
    de: {
        Kommen: "Kommen",
        Gehen: "Gehen",
        "Beginn Pause": "Beginn Pause",
        "Ende Pause": "Ende Pause",
        "Kommen Time:": "Kommen Zeit:",
        "Pause Beginn Time:": "Pause Beginn Zeit:",
        "Pause End Time:": "Pause Ende Zeit:",
        "Gehen Time:": "Gehen Zeit:",
        Save: "Speichern",
        "Auto Submit": "Automatisch Senden"
    },
    en: {
        Kommen: "Clock-in",
        Gehen: "Clock-out",
        "Beginn Pause": "Start of break",
        "Ende Pause": "End of break",
        "Kommen Time:": "Clock-in Time:",
        "Pause Beginn Time:": "Break Start Time:",
        "Pause End Time:": "Break End Time:",
        "Gehen Time:": "Clock-out Time:",
        Save: "Save",
        "Auto Submit": "Auto Submit"
    }
};
const translate = e => translations[currentLanguage][e] || e;
const milliSecondsToday = () => {
    var e = new Date,
        t = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    return e.getTime() - t.getTime()
};
const timeWithoutSeconds = e => Math.floor(e / ONE_MIN) * ONE_MIN;
const formatTime = (e, t) => (t = t || !1) ? (e / ONE_HOUR).toFixed(2) + "h" : new Date(e).toISOString().slice(11, 16);
const saveDefaultTimeSettings = (e, t, n, i, a) => {
    userSettings.defaultTimes = {
        begin: e,
        pauseBegin: t,
        pauseEnd: n,
        end: i,
        autoSubmit: a
    }, localStorage.setItem("userSettings", JSON.stringify(userSettings)), updateButtonLabels()
};
const updateButtonLabels = () => {
    if (buttonContainer) {
        var t = buttonContainer.querySelectorAll(".time-event-button"),
            n = [userSettings.defaultTimes.begin, userSettings.defaultTimes.pauseBegin, userSettings.defaultTimes.pauseEnd, userSettings.defaultTimes.end],
            i = [translate("Kommen"), translate("Beginn Pause"), translate("Ende Pause"), translate("Gehen")];
        for (let e = 0; e < t.length; e++) t[e].textContent = `${i[e]} (${n[e].slice(0, 5)})`
    }
};
const addConfigInputs = e => {
    (configContainer = document.createElement("div")).classList.add("config-container");
    var t = (e, t, n) => {
        var i = document.createElement("div"),
            a = (i.classList.add("config-input-container"), document.createElement("label")),
            e = (a.textContent = translate(e), a.setAttribute("for", n), i.appendChild(a), document.createElement("input"));
        return e.type = "time", e.id = n, e.value = t.slice(0, 5), i.appendChild(e), i
    },
        n = t("Kommen Time:", userSettings.defaultTimes.begin, "kommenTime"),
        i = t("Pause Beginn Time:", userSettings.defaultTimes.pauseBegin, "pauseBeginnTime"),
        a = t("Pause Ende Time:", userSettings.defaultTimes.pauseEnd, "pauseEndTime"),
        t = t("Gehen Time:", userSettings.defaultTimes.end, "gehenTime"),
        n = (configContainer.appendChild(n), configContainer.appendChild(i), configContainer.appendChild(a), configContainer.appendChild(t), document.createElement("div")),
        i = (n.classList.add("config-checkbox-container"), document.createElement("input")),
        a = (i.type = "checkbox", i.id = "autoSubmit", i.checked = userSettings.defaultTimes.autoSubmit, n.appendChild(i), document.createElement("label")),
        t = (a.textContent = translate("Auto Submit"), a.setAttribute("for", "autoSubmit"), n.appendChild(a), configContainer.appendChild(n), document.createElement("button"));
    t.textContent = translate("Save"), t.classList.add("config-button"), t.addEventListener("click", () => {
        const e = document.querySelector(".config-button");
        e.disabled = !0, e.classList.add("saving");
        var t = document.getElementById("kommenTime").value + ":00",
            n = document.getElementById("pauseBeginnTime").value + ":00",
            i = document.getElementById("pauseEndTime").value + ":00",
            a = document.getElementById("gehenTime").value + ":00",
            o = document.getElementById("autoSubmit").checked;
        saveDefaultTimeSettings(t, n, i, a, o), setTimeout(() => {
            e.disabled = !1, e.textContent = translate("Save"), e.classList.remove("saving")
        }, 1e3)
    }), configContainer.appendChild(t), e.parentNode.insertBefore(configContainer, e.nextSibling)
};
const addButtons = () => {
    var e = document.getElementById("__title2");
    if (e && !document.querySelector(".button-container")) {
        (buttonContainer = document.createElement("div")).classList.add("button-container"), addConfigInputs(e);
        const i = [translate("Kommen"), translate("Beginn Pause"), translate("Ende Pause"), translate("Gehen")];
        var t = [userSettings.defaultTimes.begin, userSettings.defaultTimes.pauseBegin, userSettings.defaultTimes.pauseEnd, userSettings.defaultTimes.end];
        for (let e = 0; e < i.length; e++) {
            var n = document.createElement("button");
            n.textContent = `${i[e]} (${t[e].slice(0, 5)})`, n.classList.add("time-event-button"), n.addEventListener("click", () => {
                handleButtonClick(i[e])
            }), buttonContainer.appendChild(n)
        }
        e.parentNode.insertBefore(buttonContainer, configContainer.nextSibling), buttonsAdded = !0
    } else e || console.warn("Title bar not found. Buttons not added.")
};
const handleButtonClick = t => {
    var e = document.getElementById("__xmlview0--idTimeEventType-inner");
    const o = document.getElementById("__xmlview0--timePicker-inner");
    if (e)
        if (e.value = t, e.dispatchEvent(new Event("input", {
            bubbles: !0
        })), e.dispatchEvent(new Event("change", {
            bubbles: !0
        })), e.blur(), o) {
            let e = "";
            switch (t) {
                case translate("Kommen"):
                    e = userSettings.defaultTimes.begin;
                    break;
                case translate("Beginn Pause"):
                    e = userSettings.defaultTimes.pauseBegin;
                    break;
                case translate("Ende Pause"):
                    e = userSettings.defaultTimes.pauseEnd;
                    break;
                case translate("Gehen"):
                    e = userSettings.defaultTimes.end
            }
            e && (o.value = e, o.dispatchEvent(new Event("input", {
                bubbles: !0
            })), o.dispatchEvent(new Event("change", {
                bubbles: !0
            })), o.blur(), o.dispatchEvent(new FocusEvent("blur")), setTimeout(() => {
                const e = o.value;
                var [t, n, i] = e.split(":");
                let a = parseInt(i, 10);
                59 === a ? a = 0 : a += 1;
                i = t + `:${n}:` + String(a).padStart(2, "0");
                o.value = i, o.dispatchEvent(new Event("input", {
                    bubbles: !0
                })), o.dispatchEvent(new Event("change", {
                    bubbles: !0
                })), o.blur(), o.dispatchEvent(new FocusEvent("blur")), setTimeout(() => {
                    o.value = e, o.dispatchEvent(new Event("input", {
                        bubbles: !0
                    })), o.dispatchEvent(new Event("change", {
                        bubbles: !0
                    })), o.blur(), o.dispatchEvent(new FocusEvent("blur"))
                }, 100)
            }, 100), userSettings.defaultTimes.autoSubmit) && setTimeout(triggerSaveButton, 200)
        } else console.warn("Time picker input field not found.");
    else console.warn("Time event type input field not found.")
};
const triggerSaveButton = () => {
    let e = sap.ui.getCore().byId("__xmlview0--save");
    e || (console.warn("Save button not found immediately. Trying to find it using querySelector."), e = document.querySelector(".sapMDialog .sapMBar .sapMDialogBeginButton")), e ? e.firePress ? (e.firePress(), console.log("Save button clicked using firePress.")) : (console.warn("saveButton.firePress is not a function.  Trying click()."), e.click(), console.log("Save button clicked using click().")) : console.error("Save button not found.")
},
    style = document.createElement("style"),
    detectLanguage = (style.innerHTML = `
.sapMIBar.sapMTB .sapMBarChild:last-child:only-child {
    margin-bottom: 20px;
}
.sapMSplitContainerHideMode>.sapMSplitContainerDetail .sapMITB.sapUiResponsiveContentPadding>.sapMITBContainerContent>.sapMITBContent, .sapMITB.sapUiResponsiveContentPadding>.sapMITBContainerContent>.sapMITBContent {
    padding-bottom: 60px !important
}
.time-event-button {
    margin-right: 5px;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
    cursor: pointer;
}
.time-event-button:hover {
    background-color: #eee;
}
.button-container {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 5px;
    position: relative;
    margin-top: -400px;
    width: 600px;
}
.config-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-bottom: 100px !important;
}
.config-input-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 5px;
}
.config-input-container label {
    margin-bottom: 5px;
    font-weight: bold;
}
.config-input-container input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 150px;
}
.config-button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
    cursor: pointer;
    margin-top: 5px;
    height: 32px;
}
.config-button:hover {
    background-color: #eee;
}
.config-checkbox-container {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}
.config-checkbox-container label {
    margin-left: 5px;
}
.config-button.saving {
    background-color: #ddd;
    cursor: wait;
}

.config-button.saving::after {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: 5px;
    border: 2px solid #333;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
`, document.head.appendChild(style), () => {
            currentLanguage = document.documentElement.lang, languageDetected = !0, updateButtonLabels()
        });
let nextEventTypeSet = !1;

console.error("DEBUG", "Time events extension loaded.");
setInterval(() => {
    var n = sap.ui.getCore().byId("__xmlview0--idEventsTable");
    var i = sap.ui.getCore().byId("__xmlview0--idIconTabBarNoIcons").getSelectedKey();
    if (languageDetected || detectLanguage(), n) {
        var d = n.getItems().map(e => e.getBindingContext("timeEventList").getObject());
        console.error("DEBUG", "Time events: ", d);
        for (let key of ["begin", "pauseBegin", "pauseEnd", "end"]) {
            userSettings.defaultTimes[key] = getRandomizedTime(userSettings.defaultTimes[key]);
        }
        let e;
        if (0 < d.length) switch (d[d.length - 1].TimeType) {
            case TIME_EVENT_TYPE_CLOCK_IN:
                e = TIME_EVENT_TYPE_BEGIN_BREAK;
                break;
            case TIME_EVENT_TYPE_BEGIN_BREAK:
                e = TIME_EVENT_TYPE_END_BREAK;
                break;
            case TIME_EVENT_TYPE_END_BREAK:
                e = TIME_EVENT_TYPE_CLOCK_OUT
        } else e = translate("Kommen");
        var u = sap.ui.getCore().byId("__xmlview0--idTimeEventType");
        u && !nextEventTypeSet && (u.setSelectedKey(e), nextEventTypeSet = !0);
        let t;
        if (0 < d.length) {
            d.forEach((e, t, n) => {
                0 < t && "P02" === e.TimeType && (n[t - 1].TimeType !== TIME_EVENT_TYPE_BEGIN_BREAK ? e.TimeType = TIME_EVENT_TYPE_BEGIN_BREAK : e.TimeType = TIME_EVENT_TYPE_END_BREAK)
            });
            var u = d[d.length - 1];
            u.TimeType === TIME_EVENT_TYPE_BEGIN_BREAK ? d.push({
                TimeType: TIME_EVENT_TYPE_END_BREAK,
                EventTime: {
                    ms: milliSecondsToday()
                }
            }) : u.TimeType !== TIME_EVENT_TYPE_CLOCK_OUT && d.push({
                TimeType: TIME_EVENT_TYPE_CLOCK_OUT,
                EventTime: {
                    ms: milliSecondsToday()
                }
            });
            let a = 0;
            let o = 0;
            let s = 0;
            let r = !1;
            let l = 0;
            d.forEach((e, t, n) => {
                e.TimeType === TIME_EVENT_TYPE_CLOCK_IN && (l = l || timeWithoutSeconds(n[t].EventTime.ms));
                var i = n[t + 1];
                i && (n = timeWithoutSeconds(n[t + 1].EventTime.ms) - timeWithoutSeconds(n[t].EventTime.ms), e.TimeType === TIME_EVENT_TYPE_BEGIN_BREAK && i.TimeType === TIME_EVENT_TYPE_END_BREAK || e.TimeType === TIME_EVENT_TYPE_CLOCK_OUT && i.TimeType === TIME_EVENT_TYPE_CLOCK_IN ? (o += n, n >= FIFTEEN_MINS && (s += n)) : e.TimeType === TIME_EVENT_TYPE_CLOCK_IN || e.TimeType === TIME_EVENT_TYPE_END_BREAK ? (n > SIX_HOURS && (r = !0), a += n) : console.log("Time events inconsistent. Please check!"))
            });
            var u = Math.max(0, a - INDIVIDUAL_WORK_HOURS);
            var d = o;
            var m = (o = o > THIRTY_MINS ? o : THIRTY_MINS, l + o + INDIVIDUAL_WORK_HOURS);
            var E = (t = `Working hours: ${formatTime(a, TIME_IN_HOURS)} | Break time: ${formatTime(d, TIME_IN_HOURS)} | Official break time (>= 15 mins): ${formatTime(s, TIME_IN_HOURS)} | Overtime: ${formatTime(u, TIME_IN_HOURS)} | End: ` + formatTime(m, !1), sap.ui.getCore().byId("__layout0"));
            var c = sap.ui.getCore().byId("__vbox0");
            var T = E.getContent();
            var g = c.getItems();
            if (2 < T.length)
                for (let e = 2; e < T.length; e++) E.removeContent(T[e]);
            if (3 < g.length)
                for (let e = 3; e < g.length; e++) c.removeItem(g[e]);
            let e;
            a >= SIX_HOURS && a < NINE_HOURS && s < THIRTY_MINS ? e = new sap.m.ObjectStatus({
                text: "Working time violation: Official break time needs to be 30mins at least. Only breaks of 15 minutes or more are official.",
                state: "Error",
                icon: "sap-icon://alert"
            }).addStyleClass("sapUiTinyMarginTop") : a >= NINE_HOURS && s < FOURTYFIVE_MINS && (e = new sap.m.ObjectStatus({
                text: "Working time violation: Official break time needs to be 45mins at least. Only breaks of 15 minutes or more are official.",
                state: "Error",
                icon: "sap-icon://alert"
            }).addStyleClass("sapUiTinyMarginTop")), a > TEN_HOURS && (e = new sap.m.ObjectStatus({
                text: "Working time violation: Max. working time per day is 10 hours",
                state: "Error",
                icon: "sap-icon://alert"
            }).addStyleClass("sapUiTinyMarginTop")), (e = r ? new sap.m.ObjectStatus({
                text: "Working time violation: Worked 6 hours or more without a break. Only breaks of 15 minutes or more are official.",
                state: "Error",
                icon: "sap-icon://alert"
            }).addStyleClass("sapUiTinyMarginTop") : e) && (E.addContent(e), c.addItem(e.clone()))
        } else t = "No time events recorded";
        i === TAB_QUICK_ENTRY ? (d = sap.ui.getCore().byId("__toolbar0")) && (d.setHeight("auto"), u = d.getTitleControl()) && (u.setWrapping(!0), u.setText(t)) : i === TAB_CREATE_EVENT ? (m = document.getElementById("__title0")) && (m.innerHTML = t) : i === TAB_EVENT_LIST && (d = sap.ui.getCore().byId(n.getHeaderToolbar().getTitleId())) && d.setText(t)
    } else console.log("timeEventsTable not found");
    i === TAB_CREATE_EVENT ? addButtons() : (buttonContainer && buttonContainer.parentNode && (buttonContainer.parentNode.removeChild(buttonContainer), buttonsAdded = !1), configContainer && configContainer.parentNode && configContainer.parentNode.removeChild(configContainer), messagesExtracted = !1, nextEventTypeSet = !1)
}, 1e3);
