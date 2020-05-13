import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Translate } from 'react-localize-redux';
import { generateSeedPhrase } from 'near-seed-phrase';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { validateEmail } from '../../../utils/account';
import { setupRecoveryMessage, redirectToApp, loadRecoveryMethods } from '../../../actions/account';
import RecoveryOption from './RecoveryOption';
import FormButton from '../../common/FormButton';
import SetupRecoveryMethodSuccess from './SetupRecoveryMethodSuccess';

const Container = styled.form`

    margin-bottom: 100px;
    
    button {
        text-transform: uppercase !important;
        margin-top: 50px !important;
        @media (min-width: 768px) {
            width: 290px !important;
        }
    }

    h2 {
        max-width: 800px;
        color: #4a4f54 !important;

        @media (max-width: 767px) {
            font-size: 14px !important;
            line-height: 18px !important;
            color: #999 !important;
            margin-bottom: -15px;
        }
    }

`

const OptionHeader = styled.h4`
    margin-top: 40px;
`

const OptionSubHeader = styled.div`
    margin-top: 10px;
    max-width: 540px;
    line-height: 150%;
`

class SetupRecoveryMethod extends Component {

    state = {
        option: 'email',
        phoneNumber: '',
        email: '',
        success: false,
        activeMethods: []
    }

    componentDidMount() {
        const {loadRecoveryMethods, accountId, router } = this.props;
        const { activeMethods, method } = router.location;

        if (method) {
            this.setState({ option: method });
        }

        if (activeMethods) {
            this.setState({ activeMethods: activeMethods });
        } else {
            loadRecoveryMethods(accountId)
                .then(({ error, payload }) => {
                    if (error) return;
                    this.setState({
                        activeMethods: payload.map(method => method.kind)
                    });
                })
        }
    }

    get isValidInput() {
        const { option, phoneNumber, email } = this.state;

        switch (option) {
            case 'email':
                return validateEmail(email)
            case 'phone':
                return isValidPhoneNumber(phoneNumber)
            case 'phrase':
                return true
            default:
                return false
        }
    }

    handleNext = () => {
        const { option, activeMethods } = this.state;
        
        if ((option === 'email' && !activeMethods.includes('email')) || (option === 'phone' && !activeMethods.includes('phone'))) {
            this.handleSendLink()
        } else if (option === 'phrase' && !activeMethods.includes('phrase')) {
            let phraseUrl = `/setup-seed-phrase/${this.props.accountId}`;
            this.props.history.push(phraseUrl);
        }
    }

    handleSendLink = () => {
        const { seedPhrase, publicKey } = generateSeedPhrase();
        const accountId = this.props.accountId;
        const { phoneNumber, email } = this.state;

        this.props.setupRecoveryMessage({ accountId, phoneNumber, email ,publicKey, seedPhrase })
            .then(({ error }) => {
                if (error) return

                this.setState({ success: true });
            })
    }

    handleGoBack = () => {
        this.setState({
            email: '',
            phoneNumber: '',
            success: false
        })
    }

    render() {

        const { option, phoneNumber, email, success, activeMethods } = this.state;
        const { actionsPending, formLoader, redirectToApp } = this.props;
        const sendingMessage = actionsPending.includes('SETUP_RECOVERY_MESSAGE');

        if (!success) {
            return (
                <Container className='ui container' onSubmit={e => {this.handleNext(); e.preventDefault();}}>
                    <h1><Translate id='setupRecovery.header'/></h1>
                    <h2><Translate id='setupRecovery.subHeader'/></h2>
                    <OptionHeader><Translate id='setupRecovery.basicSecurity'/></OptionHeader>
                    <OptionSubHeader><Translate id='setupRecovery.basicSecurityDesc'/></OptionSubHeader>
                    <RecoveryOption
                        onClick={() => this.setState({ option: 'email' })}
                        option='email'
                        active={option}
                        disabled={activeMethods.includes('email')}
                    >
                        <Translate>
                            {({ translate }) => (
                                <input 
                                    placeholder={translate('setupRecovery.emailPlaceholder')}
                                    value={email}
                                    onChange={e => this.setState({ email: e.target.value })}
                                />
                            )}
                        </Translate>
                    </RecoveryOption>
                    <RecoveryOption
                        onClick={() => this.setState({ option: 'phone' })}
                        option='phone'
                        active={option}
                        disabled={activeMethods.includes('phone')}
                    >
                        <Translate>
                            {({ translate }) => (
                                <PhoneInput
                                    placeholder={translate('setupRecovery.phonePlaceholder')}
                                    value={phoneNumber}
                                    onChange={value => this.setState({ phoneNumber: value })}
                                />
                            )}
                        </Translate>
                    </RecoveryOption>
                    <OptionHeader><Translate id='setupRecovery.advancedSecurity'/></OptionHeader>
                    <OptionSubHeader><Translate id='setupRecovery.advancedSecurityDesc'/></OptionSubHeader>
                    <RecoveryOption
                        onClick={() => this.setState({ option: 'phrase' })}
                        option='phrase'
                        active={option}
                        disabled={activeMethods.includes('phrase')}
                    />
                    <FormButton
                        color='blue'
                        type='submit'
                        disabled={!this.isValidInput}
                        sending={formLoader && sendingMessage}
                    >
                        <Translate id={`button.${option !== 'phrase' ? 'protectAccount' : 'setupPhrase'}`}/>
                    </FormButton>
                </Container>
            )
        } else {
            return (
                <SetupRecoveryMethodSuccess
                    option={option}
                    phoneNumber={phoneNumber}
                    email={email}
                    onConfirm={redirectToApp}
                    onGoBack={this.handleGoBack}
                />
            )
        }
    }
}

const mapDispatchToProps = {
    setupRecoveryMessage,
    redirectToApp,
    loadRecoveryMethods
}

const mapStateToProps = ({ account, router, recoveryMethods }, { match }) => ({
    ...account,
    router,
    accountId: match.params.accountId,
    recoveryMethods
})

export const SetupRecoveryMethodWithRouter = connect(mapStateToProps, mapDispatchToProps)(SetupRecoveryMethod);