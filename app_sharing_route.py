@app.route('/share/<token>')
def get_plan(token):
    """Dalış planını token ile getir"""
    try:
        # In a real app, you would look up the plan by token in the database
        # For now, we'll decode the token to get the plan ID
        # In a production system, this would be replaced with proper database lookup
        
        # Try to find the plan in the database
        plan = DivePlan.query.filter_by(share_token=token).first()
        
        if plan:
            # Convert to dictionary for JSON response
            plan_data = plan.to_dict()
            
            # Render template with plan data
            return render_template('share.html', plan=plan_data, title=f"Dive Plan - {plan.location or 'Unknown location'}")
        else:
            # For demonstration, show a placeholder
            return render_template('share_not_found.html')
    except Exception as e:
        print(f"Error retrieving shared plan: {e}")
        return render_template('share_error.html')
