import React, { useState } from 'react';
import AdminAuthLayout from './components/AdminAuthLayout';
import AdminSignInScreen from './components/AdminSignInScreen';
import AdminTwoFactorScreen from './components/AdminTwoFactorScreen';
import AdminActivateAccountScreen from './components/AdminActivateAccountScreen';
import AdminAccessDeniedScreen from './components/AdminAccessDeniedScreen';
import AdminForgotPasswordScreen from './components/AdminForgotPasswordScreen';
import AdminPasswordResetSentScreen from './components/AdminPasswordResetSentScreen';
import AdminSetNewPasswordScreen from './components/AdminSetNewPasswordScreen';
import AdminPasswordResetCompleteScreen from './components/AdminPasswordResetCompleteScreen';
import AdminSignInErrorScreen from './components/AdminSignInErrorScreen';
import AdminRecoveryCodeScreen from './components/AdminRecoveryCodeScreen';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('sign-in');
  const [adminUser, setAdminUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('admin@alterationconnect.com');
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [dashboardModal, setDashboardModal] = useState(null);

  const handleSignInSubmit = (userData) => {
    setAuthEmail(userData.email);
    setCurrentScreen('two-factor');
  };

  const handleTwoFactorVerified = () => {
    setAdminUser({
      name: 'Platform Admin',
      email: authEmail,
      role: 'Platform Admin'
    });
    setDashboardTab('overview');
    setCurrentScreen('dashboard');
  };

  const handleBack = () => {
    switch (currentScreen) {
      case 'two-factor':
      case 'activate-account':
      case 'access-denied':
      case 'forgot-password':
      case 'password-reset-complete':
      case 'sign-in-error':
        setCurrentScreen('sign-in');
        break;
      case 'recovery-code':
        setCurrentScreen('two-factor');
        break;
      case 'password-reset-sent':
        setCurrentScreen('forgot-password');
        break;
      case 'create-new-password':
        setCurrentScreen('password-reset-sent');
        break;
      case 'sign-in':
      default:
        window.history.back?.();
        break;
    }
  };

  const handleNavigateScreen = (key) => {
    if (key.startsWith('modal-')) {
      const modalKey = key.replace('modal-', '');
      setDashboardModal(modalKey);
      setCurrentScreen('dashboard');
    } else if (key.startsWith('dash-')) {
      const tab = key.replace('dash-', '');
      setDashboardTab(tab);
      setDashboardModal(null);
      setCurrentScreen('dashboard');
    } else if (key === 'dashboard') {
      setDashboardTab('overview');
      setDashboardModal(null);
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen(key);
    }
  };

  // If viewing Product Screens (Dashboard Console)
  if (currentScreen === 'dashboard') {
    return (
      <AdminDashboard 
        user={adminUser} 
        initialTab={dashboardTab}
        initialModal={dashboardModal}
        onSignOut={() => {
          setAdminUser(null);
          setCurrentScreen('sign-in');
        }}
        onBackToAuth={() => setCurrentScreen('sign-in')}
      />
    );
  }

  return (
    <AdminAuthLayout 
      onBack={handleBack}
      showBackButton={true}
      backText="Back"
    >
      {/* 01 · Access / Sign in */}
      {currentScreen === 'sign-in' && (
        <AdminSignInScreen
          initialEmail={authEmail}
          onRequireTwoFactor={handleSignInSubmit}
          onSignIn={handleSignInSubmit}
          onForgotPassword={() => setCurrentScreen('forgot-password')}
          onActivateAccount={() => setCurrentScreen('activate-account')}
          onAccessDenied={(email) => {
            setAuthEmail(email);
            setCurrentScreen('access-denied');
          }}
        />
      )}

      {/* 02 · Access / Two-factor verification */}
      {currentScreen === 'two-factor' && (
        <AdminTwoFactorScreen
          email={authEmail}
          onVerify={handleTwoFactorVerified}
          onUseDifferentEmail={() => setCurrentScreen('sign-in')}
          onUseRecoveryCode={() => setCurrentScreen('recovery-code')}
        />
      )}

      {/* 03 · Access / Accept admin invitation */}
      {currentScreen === 'activate-account' && (
        <AdminActivateAccountScreen
          onBackToSignIn={() => setCurrentScreen('sign-in')}
          onActivated={(userData) => {
            setAuthEmail(userData.email);
            setCurrentScreen('two-factor');
          }}
        />
      )}

      {/* 04 · Access / Access denied */}
      {currentScreen === 'access-denied' && (
        <AdminAccessDeniedScreen
          userEmail={authEmail}
          onReturnToSignIn={() => setCurrentScreen('sign-in')}
        />
      )}

      {/* 05 · Access / Forgot password */}
      {currentScreen === 'forgot-password' && (
        <AdminForgotPasswordScreen
          onBackToSignIn={() => setCurrentScreen('sign-in')}
          onSendResetLink={(email) => {
            setAuthEmail(email);
            setCurrentScreen('password-reset-sent');
          }}
        />
      )}

      {/* 06 · Access / Password reset email sent */}
      {currentScreen === 'password-reset-sent' && (
        <AdminPasswordResetSentScreen
          email={authEmail}
          onContinueToReset={(data) => {
            if (data?.email) setAuthEmail(data.email);
            setCurrentScreen('create-new-password');
          }}
          onResendLink={() => adminAuthService.forgotPassword(authEmail)}
        />
      )}

      {/* 07 · Access / Create new password */}
      {currentScreen === 'create-new-password' && (
        <AdminSetNewPasswordScreen
          email={authEmail}
          onPasswordUpdated={() => setCurrentScreen('password-reset-complete')}
          onBackToSignIn={() => setCurrentScreen('sign-in')}
        />
      )}

      {/* 08 · Access / Password reset complete */}
      {currentScreen === 'password-reset-complete' && (
        <AdminPasswordResetCompleteScreen
          onReturnToSignIn={() => setCurrentScreen('sign-in')}
        />
      )}

      {/* 09 · Access / Sign-in error */}
      {currentScreen === 'sign-in-error' && (
        <AdminSignInErrorScreen
          initialEmail={authEmail}
          onSignIn={handleSignInSubmit}
          onForgotPassword={() => setCurrentScreen('forgot-password')}
          onActivateAccount={() => setCurrentScreen('activate-account')}
        />
      )}

      {/* 10 · Access / Recovery code */}
      {currentScreen === 'recovery-code' && (
        <AdminRecoveryCodeScreen
          onVerify={handleTwoFactorVerified}
          onUseAuthenticator={() => setCurrentScreen('two-factor')}
        />
      )}
    </AdminAuthLayout>
  );
}
