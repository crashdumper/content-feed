import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ApplicationState } from '../store';
import * as FeedStore from '../store/Feed';
import Iframe from 'react-iframe'

type FeedProps =
    FeedStore.FeedState &
    typeof FeedStore.actionCreators &
    RouteComponentProps<{lastContentItemId: string}>;

class Feed extends React.PureComponent<FeedProps> {

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
                {this.renderFeed()}
            </React.Fragment>
        );
    }

    private renderFeed() {
        return (
            <div>
                {this.props.contentItems.map((contentItem: FeedStore.ContentItemModel) => {
                        let result;
                        if (contentItem.type == "youtube") {
                            result =
                                <Iframe url={contentItem.link.replace('watch?v=', 'embed/')}
                                        width="560px"
                                        height="315px" 
                                        position="relative"/>;
                        }

                        return result;
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
