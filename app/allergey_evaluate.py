import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def load_dataset(file_path="food_allergy_dataset.csv"):
    df = pd.read_csv(file_path)
    print("Dataset loaded successfully!")
    print("Shape:", df.shape)
    return df

def preprocess_data(df):
    data = df.copy()

    label_cols = ['Gender', 'Family_History', 'Previous_Reaction',
                  'Symptoms', 'Food_Type', 'Medical_Conditions']
    
    encoder = LabelEncoder()
    for col in label_cols:
        data[col] = encoder.fit_transform(data[col])

    X = data.drop(columns=['Allergic'])
    y = data['Allergic']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler, encoder

def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"\n🎯 Model Accuracy: {acc:.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    return model

def predict_user_allergy(model, scaler, encoder):
    print("\nEnter user details to predict allergy:")

    age = int(input("Age (5–80): "))
    gender = input("Gender (Male/Female/Other): ")
    family_history = input("Family History (Yes/No): ")
    prev_reaction = input("Previous Reaction (None/Mild/Moderate/Severe): ")
    symptoms = input("Symptoms (Skin rash/Swelling/Nausea/Breathing issues/No symptoms): ")
    food_type = input("Food Type (Dairy/Nuts/Seafood/Gluten/Eggs): ")
    food_freq = int(input("Food Frequency (times per month): "))
    medical_cond = input("Medical Condition (Asthma/Eczema/None): ")
    ige = float(input("IgE Level (e.g., 120.5): "))
    severity = int(input("Severity Score (0–10): "))

    user_data = pd.DataFrame([{
        "Age": age,
        "Gender": gender,
        "Family_History": family_history,
        "Previous_Reaction": prev_reaction,
        "Symptoms": symptoms,
        "Food_Type": food_type,
        "Food_Frequency": food_freq,
        "Medical_Conditions": medical_cond,
        "IgE_Levels": ige,
        "Severity_Score": severity
    }])

    label_cols = ['Gender', 'Family_History', 'Previous_Reaction',
                  'Symptoms', 'Food_Type', 'Medical_Conditions']
    
    for col in label_cols:
        user_data[col] = encoder.fit_transform(user_data[col])
    user_scaled = scaler.transform(user_data)

    prediction = model.predict(user_scaled)[0]

    if prediction == 1:
        print("\nThe user is LIKELY ALLERGIC to the food item!")
    else:
        print("\nThe user is NOT allergic to the food item.")

if __name__ == "__main__":
    df = load_dataset()
    X, y, scaler, encoder = preprocess_data(df)
    model = train_model(X, y)
    predict_user_allergy(model, scaler, encoder)
