import { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Dropdown from 'react-toolbox/lib/dropdown';
import { changeLanguage } from '../state/user';
import languages from '../i18n/languages';
import translate from '../i18n/Translate';
import fr from './images/fr.png';
import en from './images/uk.png';
import hu from './images/hu.png';
import ptbr from './images/pt-br.png';

const images = {
    fr, en, hu, ptbr
};

class LanguagePicker extends Component {
    render() {
        return (
            <Dropdown
                auto
                source={languages}
                label={this.props.strings.header}
                template={this.renderItem}
                value={this.props.currentLanguage}
                onChange={this.props.changeLanguage}
            />
        );
    }

    renderItem(item) {
        const containerStyle = {
             display: 'flex',
             flexDirection: 'row'
           };

           const imageStyle = {
             display: 'flex',
             width: '32px',
             height: '32px',
             flexGrow: 0,
             marginRight: '8px'
           };

           const contentStyle = {
             display: 'flex',
             flexDirection: 'column',
             flexGrow: 2
           };

           return (
             <div style={containerStyle}>
               <img src={images[item.value]} style={imageStyle}/>
               <div style={contentStyle}>
                 <strong>{item.name}</strong>
                 <small>{item.englishName}</small>
               </div>
             </div>
           );
    }
}

LanguagePicker.propTypes = {
    strings: PropTypes.object
};

LanguagePicker.defaultProps = {
    strings: {
        header: 'Choose a language'
    }
}

const stateToProps = state => ({
    currentLanguage: state.user.lang
});

const actionsToProps = dispatch => ({
    changeLanguage: lang => dispatch(changeLanguage(lang))
});

export default translate('LanguagePicker')(connect(stateToProps, actionsToProps)(LanguagePicker));
