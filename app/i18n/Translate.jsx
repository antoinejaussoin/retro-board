/* eslint react/prefer-stateless-function: "off" */
/* Because stateless functions don't have context it seems */
import React from 'react';
import en from './en';
import es from './es';
import fr from './fr';
import hu from './hu';
import ptbr from './pt-br';
import nl from './nl';
import ru from './ru';

const languages = { en, es, fr, hu, ptbr, nl, ru };

export default function translate(key) {
    return Component => {
        class TranslationComponent extends React.Component {
            render() {
                const strings = languages[this.context.currentLanguage][key];
                const merged = {
                    ...this.props.strings,
                    ...strings
                };
                if (strings) {
                    return (
                        <Component {...this.props}
                          strings={merged}
                          currentLanguage={this.context.currentLanguage}
                        />
                    );
                }

                return (
                    <Component {...this.props}
                      currentLanguage={this.context.currentLanguage}
                    />
                );
            }
        }

        TranslationComponent.contextTypes = {
            currentLanguage: React.PropTypes.string
        };

        TranslationComponent.propTypes = {
            strings: React.PropTypes.object
        };

        return TranslationComponent;
    };
}
