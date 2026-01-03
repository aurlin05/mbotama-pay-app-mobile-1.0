# MbotamaPay Mobile App

Application mobile de transfert d'argent pour l'Afrique de l'Ouest, construite avec Expo SDK 54.

## 🚀 Démarrage

```bash
# Installer les dépendances
npm install

# Lancer l'application
npx expo start
```

## 📱 Fonctionnalités

- Authentification par OTP (SMS)
- Transfert d'argent mobile money
- Historique des transactions
- Gestion du profil et KYC
- Support multi-pays (Sénégal, Côte d'Ivoire, Mali, etc.)

## 🎨 Design System

L'application utilise un design system moderne inspiré du frontend web MBOTAMAPAY :

### Design Tokens
- Couleurs primaires : Bleu vibrant (#3366FF)
- Typographie cohérente
- Espacements et rayons standardisés
- Ombres et animations

### Composants UI
- `Button` - Boutons avec variantes (default, outline, ghost, destructive)
- `Card` - Cartes avec ombres et variantes
- `Input` - Champs de saisie avec validation
- `StatusBadge` - Badges de statut (success, pending, failed)
- `SplashScreen` - Écran de démarrage animé

### Composants Dashboard
- `WelcomeBanner` - Bannière d'accueil avec gradient
- `KYCStatusCard` - Carte de statut KYC
- `QuickActions` - Actions rapides
- `RecentTransactions` - Transactions récentes

## 🛠️ Technologies

- Expo SDK 54
- React Native 0.81
- TypeScript
- Expo Router (navigation)
- Zustand (state management)
- Axios (HTTP client)
- Expo Secure Store (stockage sécurisé)
- Expo Linear Gradient (gradients)
- Expo Blur (effets de flou)

## 📁 Structure

```
├── app/                  # Écrans (expo-router)
│   ├── (auth)/          # Authentification
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── verify-otp.tsx
│   └── (tabs)/          # Navigation principale
│       ├── index.tsx    # Accueil/Dashboard
│       ├── transfer.tsx # Transfert
│       ├── history.tsx  # Historique
│       └── profile.tsx  # Profil
├── src/
│   ├── components/      # Composants UI
│   │   ├── ui/          # Composants de base
│   │   └── dashboard/   # Composants dashboard
│   ├── constants/       # Configuration & Theme
│   │   ├── config.ts
│   │   ├── colors.ts
│   │   └── theme.ts     # Design tokens
│   ├── hooks/           # Hooks personnalisés
│   │   ├── useTheme.ts
│   │   └── useColors.ts
│   ├── services/        # API services
│   ├── store/           # État global (Zustand)
│   └── types/           # Types TypeScript
└── assets/              # Images et fonts
```

## ⚙️ Configuration

Créez un fichier `.env` :

```
EXPO_PUBLIC_API_URL=https://mbotamapay-backend.onrender.com/api/v1
```

## 🎯 Caractéristiques du Design

- **Navigation flottante** : Tab bar avec effet glassmorphism
- **Animations fluides** : Transitions et micro-interactions
- **Thème adaptatif** : Support du mode sombre
- **Gradients** : Utilisation de LinearGradient pour les éléments clés
- **Ombres** : Ombres subtiles pour la profondeur
- **Typographie** : Hiérarchie claire et lisible

## 📄 Licence

MIT
