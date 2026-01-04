# 🎨 MBOTAMAPAY Mobile - Design System v2.0

## Vue d'ensemble

Ce document décrit les améliorations apportées au design system de l'application mobile MBOTAMAPAY.

## ✨ Nouveaux Composants

### Composants UI de Base

| Composant | Description |
|-----------|-------------|
| `Button` | Boutons avec animations, haptics, variantes gradient/success |
| `Card` | Cartes avec variantes glass, highlight, gradient et animations |
| `OtpInput` | Input OTP avec animations de remplissage et feedback d'erreur |
| `Avatar` | Avatars avec gradients, badges et groupes |
| `Badge` | Badges avec variantes et notifications |

### Composants de Feedback

| Composant | Description |
|-----------|-------------|
| `Skeleton` | Skeletons animés pour le chargement |
| `EmptyState` | États vides avec illustrations et animations |
| `AnimatedFeedback` | Animations de succès, erreur, loading |
| `LoadingSpinner` | Spinner de chargement animé |
| `LoadingDots` | Points de chargement pulsants |
| `ProgressCircle` | Cercle de progression animé |

### Composants Interactifs

| Composant | Description |
|-----------|-------------|
| `AnimatedPressable` | Pressable avec scale animation et haptics |
| `BounceButton` | Bouton avec animation bounce |
| `BottomNav` | Navigation avec bouton central flottant |

## 🎯 Design Tokens

### Couleurs

```typescript
colors: {
  primary: { main: '#3366FF', light: '#5C85FF', dark: '#1E40AF' },
  success: { main: '#22C55E', light: '#DCFCE7' },
  warning: { main: '#F59E0B', light: '#FEF3C7' },
  destructive: { main: '#EF4444', light: '#FEE2E2' },
  accent: { orange: '#F59E0B', purple: '#8B5CF6', pink: '#EC4899', teal: '#14B8A6' }
}
```

### Espacements

```typescript
spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 }
```

### Border Radius

```typescript
borderRadius: { sm: 10, md: 12, lg: 14, xl: 18, '2xl': 24, full: 9999 }
```

### Ombres

```typescript
shadows: {
  sm: { elevation: 2 },
  md: { elevation: 4 },
  lg: { elevation: 8 },
  primary: { shadowColor: '#3366FF', elevation: 8 },
  success: { shadowColor: '#22C55E', elevation: 6 }
}
```

## 📱 Écrans Améliorés

### Login
- Animation d'entrée fluide
- Sélecteur de pays amélioré
- Input avec feedback visuel
- Bouton gradient avec haptics

### Vérification OTP
- Input OTP avec animations de remplissage
- Feedback d'erreur avec shake animation
- Timer de renvoi stylisé
- Auto-submit à la complétion

### Dashboard
- WelcomeBanner avec gradients et décorations
- QuickActions avec animations de press
- RecentTransactions avec skeletons et empty states
- KYCStatusCard avec animations de pulse

### Transfert
- Écran de succès avec confettis
- Animations de validation
- Partage de transaction

## 🔧 Utilisation

### Button avec Gradient

```tsx
<Button variant="gradient" onPress={handlePress}>
  Envoyer
</Button>
```

### Card Animée

```tsx
<Card variant="elevated" animated onPress={handlePress}>
  <Text>Contenu</Text>
</Card>
```

### Empty State

```tsx
<EmptyState
  variant="transactions"
  title="Aucune transaction"
  actionLabel="Commencer"
  onAction={handleAction}
/>
```

### Skeleton Loading

```tsx
{loading ? <TransactionSkeleton /> : <TransactionItem />}
```

## 📦 Dépendances Ajoutées

- `expo-haptics` - Retour haptique
- `react-native-gesture-handler` - Gestes avancés
- `react-native-reanimated` - Animations performantes

## 🚀 Installation

```bash
npm install
npx expo start
```

---

**Version:** 2.0.0  
**Date:** Janvier 2026  
**Projet:** MBOTAMAPAY Mobile
