
class Link extends React.Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        weh.post({
            type: this.props.messageType
        });
    }

    render() {
        return (
            <a onClick={this.handleClick}>{weh._(this.props.label)}</a>
        )
    }
}

ReactDOM.render (
    <div>
        <div className="panel">
            <h1>Quick Links</h1>
            <ul>
                <li><a href="http://scls-staff.kohalibrary.com/cgi-bin/koha/circ/returns.pl" target="_blank">Koha&#8212;Checkin</a></li>
                <li><a href="http://scls-staff.kohalibrary.com/cgi-bin/koha/circ/circulation.pl" target="_blank">Koha&#8212;Checkout</a></li>
                <li><a href="http://factfinder.census.gov/faces/nav/jsf/pages/searchresults.xhtml?refresh=t" target="_blank">American Fact Finder</a></li>
                <li><a href="http://madisonpubliclibrary.org" target="_blank">MPL Home Page</a></li>
                <li><a href="http://www.mplnet.org" target="_blank">MPLnet</a></li>
                <li><a href="http://www.madisonpubliclibrary.org/research/referenc2" target="_blank">MPL Reference Tools</a></li>
            </ul>
            <h1>Tools</h1>
            <ul>
                <li><Link messageType={"addNote"} label={"addNote"}/></li>
                <li><Link messageType={"addLostCardNote"} label={"addLostCardNote"}/></li>
                <li><Link messageType={"addr2PSTAT"} label={"addr2PSTAT"}/></li>
                <li><Link messageType={"calendarAnnouncements"} label={"calendarAnnouncements"}/></li>
                <li><a href="https://github.com/lucasschneider/mpl-koha-patch-WE" target="_blank">View Source on GitHub</a></li>
            </ul>
        </div>
        <div className="toolbar">
            <Link messageType={"open-settings"} label={"settings"}/>
        </div>
    </div>,
    document.getElementById('root')
)
