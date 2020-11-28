import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ApplicationState } from '../store';
import * as FeedStore from '../store/Feed';
import Iframe from 'react-iframe'
import { TikTok } from 'react-tiktok';
import {ChangeEvent} from "react";
import {url} from "inspector";

type FeedProps =
    FeedStore.FeedState &
    typeof FeedStore.actionCreators &
    RouteComponentProps<{lastContentItemId: string}>;

type FeedState = {
    value: string,
    file: string
}

class Feed extends React.PureComponent<FeedProps, FeedState> {
    constructor(props: FeedProps) {
        super(props);
        this.state = {value: '', file: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event: any) {
        if (event.target.type == 'file')
        {
            this.props.addNewImage(event.target.files[0], this.props.getContent)
            this.setState({value: '', file: ''});
        }
        else
        {
            this.setState({value: event.target.value, file: this.state.file});
        }        
    }

    handleSubmit(event: any) {
        this.props.addNewContentItem(this.state.value, this.props.getContent)
        this.setState({value: '', file: ''});
        event.preventDefault();
    }
    
    // This method is called when the component is first added to the document
    public componentDidMount() {
        this.ensureDataFetched();
    }

    // This method is called when the route parameters change
    public componentDidUpdate() {
        this.ensureDataFetched();
    }

    public render() {
        return (
            <React.Fragment>
                <h1>Memes</h1>
                <p>This is a simple example of a React component.</p>
                <form onSubmit={this.handleSubmit} style={{ position: "sticky", top: 10, textAlign: "right" }}>
                    <div style={{display: "inline-block"}}>
                        <input type="text" value={this.state.value} onChange={this.handleChange} style={{width: 249}}/>
                        <button type="submit">Add</button>    
                    </div>
                    <div style={{display: "block", textAlign: "right"}}>
                        <input type="file" accept="image/*" onChange={this.handleChange} />    
                    </div>                                     
                </form>
                {this.renderFeed()}
            </React.Fragment>
        );
    }

    private renderFeed() {
        return (
            <div>
                {this.props.contentItems.map((contentItem: FeedStore.ContentItemModel) => {
                        let result;
                        switch (contentItem.type) {
                            case "youtube": result =
                                <Iframe url={contentItem.link.replace('watch?v=', 'embed/')}
                                        width="560px"
                                        height="315px"
                                        position="relative"/>; 
                            break;
                            case "coub": result =
                                <Iframe url={contentItem.link.replace('view', 'embed')}
                                        width="560px"
                                        height="315px"
                                        position="relative"/>;
                                break;
                            case "tiktok":
                                result = <Iframe url={"https://www.tiktok.com/embed/v2/"+contentItem.link.substring(contentItem.link.lastIndexOf('/')) +"?lang=ru-RU"}
                                        width="343px"
                                        height="600px"
                                        position="relative"/>;
                                break;
                            case "twitch":                                
                                result = <Iframe url={"https://clips.twitch.tv/embed?clip=" + contentItem.link.substring(contentItem.link.lastIndexOf('/')+1) + "&parent=" + window.location.hostname} 
                                    frameBorder={0} 
                                    allowFullScreen={true} 
                                    scrolling="no"
                                    height="315" 
                                    width="560" />;
                                break;
                            case "image":
                                result = <img src={contentItem.link} style={{
                                    display: "block",
                                    maxHeight: 315,
                                    maxWidth: 560
                                }} />;
                                break;
                        }                    

                        return <div>
                            {result}
                            <br/>
                        </div>;
                    }
                )}                
            </div>
        );
    }

    private ensureDataFetched() {
        const startDateIndex = this.props.match.params.lastContentItemId || "";
        
        // TODO: fix date
        this.props.getContent(startDateIndex, new Date());
    }
}

export default connect(
    (state: ApplicationState) => state.feed,
    FeedStore.actionCreators
)(Feed as any);
