
function Prefs() {
    return (
        <WehParams>
            <WehVersion/>
            <WehParamSet wehPrefs={["skin","patronMsg","validAddr","autoUserId","selectPSTAT","forceDigest","restrictNotificationOptions","middleName","updateAccountType","receiptFont","disableDropbox"]}>
                <WehParam/>
            </WehParamSet>
        </WehParams>
    )
}

ReactDOM.render (
    <div>
        <h1 className="text-center">{weh._("settings")}</h1>
        <br/>
        <Prefs/>
    </div>,
    document.getElementById('root')
)

weh.setPageTitle(weh._("settings"));
